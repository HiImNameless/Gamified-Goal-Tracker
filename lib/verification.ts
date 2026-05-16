import { createClient } from "@/lib/supabase/server";
import { mapCriteria, mapProfile, mapQuest } from "@/lib/supabase/mappers";
import type { Profile, ProofSubmission, Quest, QuestCriteria } from "@/lib/types";

export interface VerificationItem {
  proof: ProofSubmission;
  quest: Quest;
  owner: Profile;
  ownerStreak: number;
  attachmentSignedUrl?: string;
}

export async function getVerificationQueue(userId: string): Promise<VerificationItem[]> {
  const supabase = createClient();

  const { data: proofRows } = await supabase
    .from("proof_submissions")
    .select("*")
    .eq("reviewer_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const proofs = proofRows ?? [];
  const questIds = Array.from(new Set(proofs.map((proof) => proof.quest_id)));

  if (questIds.length === 0) {
    return [];
  }

  const { data: questRows } = await supabase
    .from("quests")
    .select("*")
    .in("id", questIds);

  const questsById = new Map(
    (questRows ?? []).map((quest) => [quest.id, quest])
  );
  const ownerIds = Array.from(new Set((questRows ?? []).map((quest) => quest.owner_id)));

  const [profilesResult, progressResult, criteriaResult] = await Promise.all([
    ownerIds.length > 0
      ? supabase.from("profiles").select("*").in("id", ownerIds)
      : { data: [] },
    ownerIds.length > 0
      ? supabase
          .from("user_progress")
          .select("user_id, current_streak")
          .in("user_id", ownerIds)
      : { data: [] },
    supabase
      .from("quest_criteria")
      .select("*")
      .in("quest_id", questIds)
      .order("created_at", { ascending: true })
  ]);

  const profilesById = new Map(
    (profilesResult.data ?? []).map((profile) => [profile.id, mapProfile(profile)])
  );
  const streakByUserId = new Map(
    (progressResult.data ?? []).map((progress) => [
      progress.user_id,
      progress.current_streak
    ])
  );

  const criteriaByQuest = (criteriaResult.data ?? []).reduce((map, row) => {
    const criterion = mapCriteria(row);
    const existing = map.get(criterion.questId) ?? [];
    existing.push(criterion);
    map.set(criterion.questId, existing);
    return map;
  }, new Map<string, QuestCriteria[]>());

  const items = proofs.reduce<VerificationItem[]>((result, proof) => {
    const questRow = questsById.get(proof.quest_id);

    if (!questRow) {
      return result;
    }

    const owner = profilesById.get(questRow.owner_id);

    if (!owner) {
      return result;
    }

    result.push({
      proof: {
        id: proof.id,
        questId: proof.quest_id,
        submittedBy: proof.submitted_by,
        proofText: proof.proof_text,
        fileUrl: proof.file_url ?? undefined,
        status: proof.status,
        reviewerId: proof.reviewer_id ?? undefined,
        reviewerComment: proof.reviewer_comment ?? undefined,
        createdAt: proof.created_at,
        reviewedAt: proof.reviewed_at ?? undefined
      },
      quest: mapQuest(questRow, criteriaByQuest.get(questRow.id) ?? []),
      owner,
      ownerStreak: streakByUserId.get(owner.id) ?? 0
    });

    return result;
  }, []);

  const itemsWithSignedUrls = await Promise.all(
    items.map(async (item) => {
      if (!item.proof.fileUrl) {
        return item;
      }

      const { data } = await supabase.storage
        .from("quest-proofs")
        .createSignedUrl(item.proof.fileUrl, 60 * 10);

      return {
        ...item,
        attachmentSignedUrl: data?.signedUrl
      };
    })
  );

  return itemsWithSignedUrls;
}
