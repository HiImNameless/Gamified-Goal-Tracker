import { createClient } from "@/lib/supabase/server";
import {
  mapCriteria,
  mapProfile,
  mapQuest,
  mapReviewNote,
  mapStructuredItem,
  mapSkillProgress,
  mapUserProgress
} from "@/lib/supabase/mappers";
import type { Quest, QuestCriteria, QuestReviewNote, QuestStructuredItem } from "@/lib/types";

export async function getDashboardData(userId: string) {
  const supabase = createClient();

  const [profileResult, progressResult, skillsResult, questsResult] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("skill_progress")
        .select("*")
        .eq("user_id", userId)
        .order("skill_category"),
      supabase
        .from("quests")
        .select("*")
        .eq("owner_id", userId)
        .order("created_at", { ascending: false })
    ]);

  const questRows = questsResult.data ?? [];
  const questIds = questRows.map((quest) => quest.id);
  let criteriaByQuest = new Map<string, QuestCriteria[]>();
  let rewardsByQuest = new Map<string, QuestStructuredItem[]>();
  let stakesByQuest = new Map<string, QuestStructuredItem[]>();
  let reviewNotesByQuest = new Map<string, QuestReviewNote[]>();

  if (questIds.length > 0) {
    const [criteriaResult, structuredItemsResult, reviewNotesResult] = await Promise.all([
      supabase
        .from("quest_criteria")
        .select("*")
        .in("quest_id", questIds)
        .order("created_at", { ascending: true }),
      supabase
        .from("quest_structured_items")
        .select("*")
        .in("quest_id", questIds)
        .order("created_at", { ascending: true }),
      supabase
        .from("proof_submissions")
        .select("*")
        .in("quest_id", questIds)
        .order("created_at", { ascending: true })
    ]);

    criteriaByQuest = (criteriaResult.data ?? []).reduce((map, row) => {
      const criteria = mapCriteria(row);
      const existing = map.get(criteria.questId) ?? [];
      existing.push(criteria);
      map.set(criteria.questId, existing);
      return map;
    }, new Map<string, QuestCriteria[]>());

    (structuredItemsResult.data ?? []).forEach((row) => {
      const item = mapStructuredItem(row);
      const targetMap = item.type === "reward" ? rewardsByQuest : stakesByQuest;
      const existing = targetMap.get(item.questId) ?? [];
      existing.push(item);
      targetMap.set(item.questId, existing);
    });

    reviewNotesByQuest = (reviewNotesResult.data ?? []).reduce((map, row) => {
      const note = mapReviewNote(row);
      const existing = map.get(row.quest_id) ?? [];
      existing.push(note);
      map.set(row.quest_id, existing);
      return map;
    }, new Map<string, QuestReviewNote[]>());
  }

  return {
    profile: profileResult.data ? mapProfile(profileResult.data) : null,
    progress: progressResult.data ? mapUserProgress(progressResult.data) : null,
    skills: (skillsResult.data ?? []).map(mapSkillProgress),
    quests: questRows.map((quest) =>
      mapQuest(
        quest,
        criteriaByQuest.get(quest.id) ?? [],
        rewardsByQuest.get(quest.id) ?? [],
        stakesByQuest.get(quest.id) ?? [],
        reviewNotesByQuest.get(quest.id) ?? []
      )
    )
  };
}

export async function getQuestForUser(questId: string, userId: string): Promise<Quest | null> {
  const supabase = createClient();

  const { data: questRow } = await supabase
    .from("quests")
    .select("*")
    .eq("id", questId)
    .eq("owner_id", userId)
    .maybeSingle();

  if (!questRow) {
    return null;
  }

  const [criteriaResult, structuredItemsResult, reviewNotesResult] = await Promise.all([
    supabase
      .from("quest_criteria")
      .select("*")
      .eq("quest_id", questId)
      .order("created_at", { ascending: true }),
    supabase
      .from("quest_structured_items")
      .select("*")
      .eq("quest_id", questId)
      .order("created_at", { ascending: true }),
    supabase
      .from("proof_submissions")
      .select("*")
      .eq("quest_id", questId)
      .order("created_at", { ascending: true })
  ]);

  const structuredItems = (structuredItemsResult.data ?? []).map(mapStructuredItem);

  return mapQuest(
    questRow,
    (criteriaResult.data ?? []).map(mapCriteria),
    structuredItems.filter((item) => item.type === "reward"),
    structuredItems.filter((item) => item.type === "stake"),
    (reviewNotesResult.data ?? []).map(mapReviewNote)
  );
}
