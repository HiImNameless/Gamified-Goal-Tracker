"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { applyLpChange, LP_BY_DIFFICULTY } from "@/lib/ranks";
import { createClient } from "@/lib/supabase/server";
import type { CriteriaType, QuestDifficulty, QuestType, SkillCategory, Visibility } from "@/lib/types";

const questTypes: QuestType[] = ["main", "side", "boss"];
const difficulties: QuestDifficulty[] = ["easy", "medium", "hard", "boss"];
const skillCategories: SkillCategory[] = [
  "health",
  "fitness",
  "programming",
  "editing",
  "study",
  "money",
  "creativity",
  "discipline"
];
const visibilityOptions: Visibility[] = ["private", "friends"];
const criteriaTypes: CriteriaType[] = ["standalone", "count"];
const PROOF_BUCKET = "quest-proofs";

function pickOption<T extends string>(value: FormDataEntryValue | null, options: T[], fallback: T) {
  const normalized = String(value ?? "");
  return options.includes(normalized as T) ? (normalized as T) : fallback;
}

export async function createQuestAction(formData: FormData) {
  const user = await requireUser();
  const supabase = createClient();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const type = pickOption(formData.get("type"), questTypes, "side");
  const difficulty = pickOption(formData.get("difficulty"), difficulties, "easy");
  const skillCategory = pickOption(
    formData.get("skill_category"),
    skillCategories,
    "discipline"
  );
  const visibility = pickOption(formData.get("visibility"), visibilityOptions, "friends");
  const deadline = String(formData.get("deadline") ?? "").trim();
  const failureCondition = String(formData.get("failure_condition") ?? "").trim();
  const proofRequired = visibility === "friends";
  const economy = LP_BY_DIFFICULTY[difficulty];

  if (!title) {
    throw new Error("Quest title is required.");
  }

  const criteriaTitles = formData.getAll("criteria_title");
  const criteriaKinds = formData.getAll("criteria_type");
  const criteriaTargets = formData.getAll("criteria_target");

  const criteria = criteriaTitles
    .map((title, index) => {
      const normalizedTitle = String(title).trim();
      const criteriaType = pickOption(criteriaKinds[index], criteriaTypes, "standalone");
      const targetCount =
        criteriaType === "count"
          ? Math.max(1, Number(criteriaTargets[index] ?? 1) || 1)
          : 1;

      return normalizedTitle
        ? {
            title: normalizedTitle,
            type: criteriaType,
            target_count: targetCount,
            current_count: 0
          }
        : null;
    })
    .filter((criterion): criterion is NonNullable<typeof criterion> => Boolean(criterion));

  if (criteria.length === 0) {
    throw new Error("At least one success criterion is required.");
  }

  const { data: quest, error: questError } = await supabase
    .from("quests")
    .insert({
      owner_id: user.id,
      title,
      description,
      type,
      difficulty,
      status: "active",
      skill_category: skillCategory,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      failure_condition: failureCondition || null,
      reward_text: null,
      stake_text: null,
      proof_required: proofRequired,
      visibility,
      xp_reward: economy.xp,
      lp_reward: economy.reward,
      lp_penalty: economy.penalty
    })
    .select("id")
    .single();

  if (questError) {
    throw new Error(questError.message);
  }

  const { error: criteriaError } = await supabase.from("quest_criteria").insert(
    criteria.map((criterion) => ({
      ...criterion,
      quest_id: quest.id
    }))
  );

  if (criteriaError) {
    throw new Error(criteriaError.message);
  }

  const structuredItems = [
    ...formData
      .getAll("reward_title")
      .map((title) => ({ type: "reward" as const, title: String(title).trim() })),
    ...formData
      .getAll("stake_title")
      .map((title) => ({ type: "stake" as const, title: String(title).trim() }))
  ].filter((item) => item.title);

  if (structuredItems.length > 0) {
    const { error: itemsError } = await supabase.from("quest_structured_items").insert(
      structuredItems.map((item) => ({
        quest_id: quest.id,
        type: item.type,
        title: item.title
      }))
    );

    if (itemsError) {
      throw new Error(itemsError.message);
    }
  }

  await supabase.from("quest_logs").insert({
    quest_id: quest.id,
    user_id: user.id,
    action: "created",
    note: "Quest created from the dashboard."
  });

  revalidatePath("/");
  redirect("/");
}

export async function toggleCriteriaAction(formData: FormData) {
  const user = await requireUser();
  const supabase = createClient();
  const criteriaId = String(formData.get("criteria_id") ?? "");
  const questId = String(formData.get("quest_id") ?? "");
  const isCompleted = formData.get("is_completed") !== "on";

  if (!criteriaId || !questId) {
    return;
  }

  const { data: quest } = await supabase
    .from("quests")
    .select("id, status, proof_required")
    .eq("id", questId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!quest || quest.status !== "active") {
    return;
  }

  const { data: criteria } = await supabase
    .from("quest_criteria")
    .select("target_count")
    .eq("id", criteriaId)
    .eq("quest_id", questId)
    .maybeSingle();

  await supabase
    .from("quest_criteria")
    .update({
      is_completed: isCompleted,
      current_count: isCompleted ? criteria?.target_count ?? 1 : 0,
      completed_at: isCompleted ? new Date().toISOString() : null
    })
    .eq("id", criteriaId)
    .eq("quest_id", questId);

  const { data: allCriteria } = await supabase
    .from("quest_criteria")
    .select("is_completed")
    .eq("quest_id", questId);

  const allComplete =
    (allCriteria ?? []).length > 0 &&
    (allCriteria ?? []).every((criterion) => criterion.is_completed);

  if (allComplete && !quest.proof_required) {
    await completeQuest(user.id, questId);
    revalidatePath("/");
    redirect("/");
  }

  revalidatePath("/");
  revalidatePath(`/quests/${questId}`);
}

export async function submitProofAction(formData: FormData) {
  const user = await requireUser();
  const supabase = createClient();
  const questId = String(formData.get("quest_id") ?? "");
  const proofText = String(formData.get("proof_text") ?? "").trim();
  const proofFile = formData.get("proof_file");

  if (!questId) {
    return;
  }

  const { data: quest } = await supabase
    .from("quests")
    .select("id, owner_id, status, proof_required, verifier_id")
    .eq("id", questId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!quest || quest.status !== "active" || !quest.proof_required) {
    return;
  }

  const { data: criteria } = await supabase
    .from("quest_criteria")
    .select("is_completed")
    .eq("quest_id", questId);

  const allComplete =
    (criteria ?? []).length > 0 &&
    (criteria ?? []).every((criterion) => criterion.is_completed);

  if (!allComplete) {
    return;
  }

  let fileUrl: string | null = null;

  if (proofFile instanceof File && proofFile.size > 0) {
    const safeName = proofFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${user.id}/${questId}/${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from(PROOF_BUCKET)
      .upload(filePath, proofFile, {
        upsert: false
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    fileUrl = filePath;
  }

  await supabase.from("proof_submissions").insert({
    quest_id: questId,
    submitted_by: user.id,
    proof_text: proofText,
    file_url: fileUrl,
    reviewer_id: quest.verifier_id,
    status: "pending"
  });

  await supabase
    .from("quests")
    .update({
      status: "pending_verification"
    })
    .eq("id", questId)
    .eq("owner_id", user.id);

  await supabase.from("quest_logs").insert({
    quest_id: questId,
    user_id: user.id,
    action: "proof_submitted",
    note: fileUrl ? "Proof submitted with file attachment." : "Proof submitted."
  });

  revalidatePath("/");
  redirect("/");
}

export async function completeQuestAction(formData: FormData) {
  const user = await requireUser();
  const questId = String(formData.get("quest_id") ?? "");

  if (!questId) {
    return;
  }

  const supabase = createClient();
  const { data: quest } = await supabase
    .from("quests")
    .select("id, owner_id, status, proof_required")
    .eq("id", questId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!quest || quest.status !== "active" || quest.proof_required) {
    return;
  }

  const { data: criteria } = await supabase
    .from("quest_criteria")
    .select("is_completed")
    .eq("quest_id", questId);

  const allComplete =
    (criteria ?? []).length > 0 &&
    (criteria ?? []).every((criterion) => criterion.is_completed);

  if (!allComplete) {
    return;
  }

  await completeQuest(user.id, questId);

  revalidatePath("/");
  redirect("/");
}

async function completeQuest(userId: string, questId: string) {
  const supabase = createClient();
  const { data: quest } = await supabase
    .from("quests")
    .select("id, status, skill_category, xp_reward, lp_reward")
    .eq("id", questId)
    .eq("owner_id", userId)
    .maybeSingle();

  if (!quest || quest.status === "completed") {
    return;
  }

  const { data: progress } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!progress) {
    return;
  }

  const nextRank = applyLpChange(progress.rank_tier, progress.lp, quest.lp_reward);
  const completedAt = new Date().toISOString();

  await supabase
    .from("quests")
    .update({
      status: "completed",
      completed_at: completedAt
    })
    .eq("id", questId)
    .eq("owner_id", userId);

  await supabase
    .from("user_progress")
    .update({
      rank_tier: nextRank.rankTier,
      lp: nextRank.lp,
      total_xp: progress.total_xp + quest.xp_reward,
      completed_quests: progress.completed_quests + 1
    })
    .eq("user_id", userId);

  await supabase.from("lp_events").insert({
    user_id: userId,
    quest_id: questId,
    amount: quest.lp_reward,
    previous_rank_tier: progress.rank_tier,
    previous_lp: progress.lp,
    new_rank_tier: nextRank.rankTier,
    new_lp: nextRank.lp,
    reason: "Quest completed"
  });

  const { data: skill } = await supabase
    .from("skill_progress")
    .select("id, xp")
    .eq("user_id", userId)
    .eq("skill_category", quest.skill_category)
    .maybeSingle();

  if (skill) {
    await supabase
      .from("skill_progress")
      .update({
        xp: skill.xp + quest.xp_reward
      })
      .eq("id", skill.id);
  }

  await supabase.from("quest_logs").insert({
    quest_id: questId,
    user_id: userId,
    action: "completed",
    note: `Quest completed. Awarded ${quest.lp_reward} LP.`
  });
}
