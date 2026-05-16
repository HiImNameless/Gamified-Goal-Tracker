"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { LP_BY_DIFFICULTY } from "@/lib/ranks";
import { createClient } from "@/lib/supabase/server";
import type { QuestDifficulty, QuestType, SkillCategory, Visibility } from "@/lib/types";

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
  const visibility = pickOption(formData.get("visibility"), visibilityOptions, "private");
  const deadline = String(formData.get("deadline") ?? "").trim();
  const criteriaText = String(formData.get("criteria") ?? "").trim();
  const rewardText = String(formData.get("reward_text") ?? "").trim();
  const stakeText = String(formData.get("stake_text") ?? "").trim();
  const failureCondition = String(formData.get("failure_condition") ?? "").trim();
  const proofRequired = formData.get("proof_required") === "on";
  const economy = LP_BY_DIFFICULTY[difficulty];

  if (!title) {
    throw new Error("Quest title is required.");
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
      deadline: deadline ? `${deadline}T23:59:59.000Z` : null,
      failure_condition: failureCondition || null,
      reward_text: rewardText || null,
      stake_text: stakeText || null,
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

  const criteria = criteriaText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (criteria.length > 0) {
    const { error: criteriaError } = await supabase.from("quest_criteria").insert(
      criteria.map((criterion) => ({
        quest_id: quest.id,
        title: criterion
      }))
    );

    if (criteriaError) {
      throw new Error(criteriaError.message);
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
