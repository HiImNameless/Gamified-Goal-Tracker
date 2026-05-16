"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { completeQuestForUser } from "@/lib/quest-completion";
import { createClient } from "@/lib/supabase/server";

export async function approveProofAction(formData: FormData) {
  const user = await requireUser();
  const supabase = createClient();
  const proofId = String(formData.get("proof_id") ?? "");

  if (!proofId) {
    return;
  }

  const { data: proof } = await supabase
    .from("proof_submissions")
    .select("id, quest_id, submitted_by, status")
    .eq("id", proofId)
    .eq("reviewer_id", user.id)
    .eq("status", "pending")
    .maybeSingle();

  if (!proof) {
    return;
  }

  await supabase
    .from("proof_submissions")
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString()
    })
    .eq("id", proof.id)
    .eq("reviewer_id", user.id);

  await completeQuestForUser(proof.submitted_by, proof.quest_id);

  revalidatePath("/");
  revalidatePath("/verification");
}

export async function rejectProofAction(formData: FormData) {
  const user = await requireUser();
  const supabase = createClient();
  const proofId = String(formData.get("proof_id") ?? "");
  const reviewerComment = String(formData.get("reviewer_comment") ?? "").trim();
  const incompleteCriteriaIds = formData
    .getAll("incomplete_criteria_id")
    .map((value) => String(value))
    .filter(Boolean);

  if (!proofId) {
    return;
  }

  if (!reviewerComment || incompleteCriteriaIds.length === 0) {
    return;
  }

  const { data: proof } = await supabase
    .from("proof_submissions")
    .select("id, quest_id, submitted_by, status")
    .eq("id", proofId)
    .eq("reviewer_id", user.id)
    .eq("status", "pending")
    .maybeSingle();

  if (!proof) {
    return;
  }

  await supabase
    .from("proof_submissions")
    .update({
      status: "rejected",
      reviewer_comment: reviewerComment || null,
      reviewed_at: new Date().toISOString()
    })
    .eq("id", proof.id)
    .eq("reviewer_id", user.id);

  if (incompleteCriteriaIds.length > 0) {
    await supabase
      .from("quest_criteria")
      .update({
        is_completed: false,
        current_count: 0,
        completed_at: null
      })
      .eq("quest_id", proof.quest_id)
      .in("id", incompleteCriteriaIds);
  }

  await supabase
    .from("quests")
    .update({
      status: "active"
    })
    .eq("id", proof.quest_id)
    .eq("verifier_id", user.id);

  await supabase.from("quest_logs").insert({
    quest_id: proof.quest_id,
    user_id: proof.submitted_by,
    action: "proof_rejected",
    note: reviewerComment
  });

  revalidatePath("/");
  revalidatePath("/verification");
}
