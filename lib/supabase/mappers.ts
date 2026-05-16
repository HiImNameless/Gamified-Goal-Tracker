import type { Database } from "@/lib/supabase/database.types";
import type {
  Profile,
  Quest,
  QuestCriteria,
  QuestStructuredItem,
  SkillProgress,
  UserProgress
} from "@/lib/types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ProgressRow = Database["public"]["Tables"]["user_progress"]["Row"];
type QuestRow = Database["public"]["Tables"]["quests"]["Row"];
type CriteriaRow = Database["public"]["Tables"]["quest_criteria"]["Row"];
type StructuredItemRow = Database["public"]["Tables"]["quest_structured_items"]["Row"];
type SkillRow = Database["public"]["Tables"]["skill_progress"]["Row"];

export function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    avatarUrl: row.avatar_url ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapUserProgress(row: ProgressRow): UserProgress {
  return {
    userId: row.user_id,
    rankTier: row.rank_tier,
    lp: row.lp,
    totalXp: row.total_xp,
    completedQuests: row.completed_quests,
    failedQuests: row.failed_quests,
    currentStreak: row.current_streak,
    longestStreak: row.longest_streak,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapCriteria(row: CriteriaRow): QuestCriteria {
  return {
    id: row.id,
    questId: row.quest_id,
    title: row.title,
    description: row.description ?? undefined,
    type: row.type,
    targetCount: row.target_count,
    currentCount: row.current_count,
    isCompleted: row.is_completed,
    deadline: row.deadline ?? undefined,
    completedAt: row.completed_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapStructuredItem(row: StructuredItemRow): QuestStructuredItem {
  return {
    id: row.id,
    questId: row.quest_id,
    type: row.type,
    title: row.title,
    description: row.description ?? undefined,
    createdAt: row.created_at
  };
}

export function mapQuest(
  row: QuestRow,
  criteria: QuestCriteria[] = [],
  rewards: QuestStructuredItem[] = [],
  stakes: QuestStructuredItem[] = []
): Quest {
  return {
    id: row.id,
    ownerId: row.owner_id,
    title: row.title,
    description: row.description,
    type: row.type,
    difficulty: row.difficulty,
    status: row.status,
    skillCategory: row.skill_category,
    deadline: row.deadline ?? undefined,
    failureCondition: row.failure_condition ?? undefined,
    rewardText: row.reward_text ?? undefined,
    stakeText: row.stake_text ?? undefined,
    proofRequired: row.proof_required,
    verifierId: row.verifier_id ?? undefined,
    visibility: row.visibility,
    xpReward: row.xp_reward,
    lpReward: row.lp_reward,
    lpPenalty: row.lp_penalty,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at ?? undefined,
    failedAt: row.failed_at ?? undefined,
    criteria,
    rewards,
    stakes
  };
}

export function mapSkillProgress(row: SkillRow): SkillProgress {
  return {
    id: row.id,
    userId: row.user_id,
    skillCategory: row.skill_category,
    xp: row.xp,
    level: row.level,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
