export type QuestType = "main" | "side" | "boss";

export type QuestDifficulty = "easy" | "medium" | "hard" | "boss";

export type QuestStatus =
  | "draft"
  | "active"
  | "pending_verification"
  | "completed"
  | "failed"
  | "abandoned"
  | "expired";

export type SkillCategory =
  | "health"
  | "fitness"
  | "programming"
  | "editing"
  | "study"
  | "money"
  | "creativity"
  | "discipline";

export type Visibility = "private" | "friends";

export type FriendshipStatus = "pending" | "accepted" | "rejected";

export type ProofStatus = "pending" | "approved" | "rejected";

export type RankName =
  | "Novice"
  | "Apprentice"
  | "Adept"
  | "Veteran"
  | "Elite"
  | "Champion"
  | "Mythic"
  | "Ascendant";

export interface Profile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProgress {
  userId: string;
  rankTier: number;
  lp: number;
  totalXp: number;
  completedQuests: number;
  failedQuests: number;
  currentStreak: number;
  longestStreak: number;
  createdAt: string;
  updatedAt: string;
}

export interface Friendship {
  id: string;
  requesterId: string;
  receiverId: string;
  status: FriendshipStatus;
  createdAt: string;
  updatedAt: string;
}

export interface QuestCriteria {
  id: string;
  questId: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  deadline?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Quest {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  type: QuestType;
  difficulty: QuestDifficulty;
  status: QuestStatus;
  skillCategory: SkillCategory;
  deadline?: string;
  failureCondition?: string;
  rewardText?: string;
  stakeText?: string;
  proofRequired: boolean;
  verifierId?: string;
  visibility: Visibility;
  xpReward: number;
  lpReward: number;
  lpPenalty: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  failedAt?: string;
  criteria: QuestCriteria[];
}

export interface ProofSubmission {
  id: string;
  questId: string;
  submittedBy: string;
  proofText: string;
  fileUrl?: string;
  status: ProofStatus;
  reviewerId?: string;
  reviewerComment?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface QuestLog {
  id: string;
  questId: string;
  userId: string;
  action: string;
  note?: string;
  createdAt: string;
}

export interface LpEvent {
  id: string;
  userId: string;
  questId?: string;
  amount: number;
  previousRankTier: number;
  previousLp: number;
  newRankTier: number;
  newLp: number;
  reason: string;
  createdAt: string;
}

export interface SkillProgress {
  id: string;
  userId: string;
  skillCategory: SkillCategory;
  xp: number;
  level: number;
  createdAt: string;
  updatedAt: string;
}
