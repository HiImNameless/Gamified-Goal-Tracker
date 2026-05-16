import { createClient } from "@/lib/supabase/server";
import {
  mapCriteria,
  mapProfile,
  mapQuest,
  mapSkillProgress,
  mapUserProgress
} from "@/lib/supabase/mappers";
import type { Quest, QuestCriteria } from "@/lib/types";

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

  if (questIds.length > 0) {
    const { data: criteriaRows } = await supabase
      .from("quest_criteria")
      .select("*")
      .in("quest_id", questIds)
      .order("created_at", { ascending: true });

    criteriaByQuest = (criteriaRows ?? []).reduce((map, row) => {
      const criteria = mapCriteria(row);
      const existing = map.get(criteria.questId) ?? [];
      existing.push(criteria);
      map.set(criteria.questId, existing);
      return map;
    }, new Map<string, QuestCriteria[]>());
  }

  return {
    profile: profileResult.data ? mapProfile(profileResult.data) : null,
    progress: progressResult.data ? mapUserProgress(progressResult.data) : null,
    skills: (skillsResult.data ?? []).map(mapSkillProgress),
    quests: questRows.map((quest) =>
      mapQuest(quest, criteriaByQuest.get(quest.id) ?? [])
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

  const { data: criteriaRows } = await supabase
    .from("quest_criteria")
    .select("*")
    .eq("quest_id", questId)
    .order("created_at", { ascending: true });

  return mapQuest(questRow, (criteriaRows ?? []).map(mapCriteria));
}
