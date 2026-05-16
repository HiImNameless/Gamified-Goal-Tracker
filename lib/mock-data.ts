import type { Profile, Quest, SkillProgress, UserProgress } from "@/lib/types";
import { LP_BY_DIFFICULTY } from "@/lib/ranks";

const now = new Date("2026-05-16T08:00:00.000Z").toISOString();

export const mockProfile: Profile = {
  id: "user-brandon",
  username: "brandonsquest",
  displayName: "Brandon",
  avatarUrl: undefined,
  createdAt: now,
  updatedAt: now
};

export const mockFriend: Profile = {
  id: "user-ally",
  username: "nightwatcher",
  displayName: "Jay",
  avatarUrl: undefined,
  createdAt: now,
  updatedAt: now
};

export const mockProgress: UserProgress = {
  userId: mockProfile.id,
  rankTier: 2,
  lp: 64,
  totalXp: 1260,
  completedQuests: 38,
  failedQuests: 6,
  currentStreak: 5,
  longestStreak: 18,
  createdAt: now,
  updatedAt: now
};

export const mockQuests: Quest[] = [
  {
    id: "quest-main-portfolio",
    ownerId: mockProfile.id,
    title: "Ship the portfolio rebuild",
    description:
      "Create a sharper personal portfolio with new case studies, better project pages, and a simple contact flow.",
    type: "main",
    difficulty: "hard",
    status: "active",
    skillCategory: "programming",
    lifeCategory: "wealth",
    deadline: "2026-05-30T20:00:00.000Z",
    failureCondition: "No deployable version by the deadline.",
    rewardText: "Order a proper desk lamp.",
    stakeText: "No weekend gaming until a deploy is live.",
    proofRequired: true,
    verifierId: mockFriend.id,
    visibility: "friends",
    xpReward: LP_BY_DIFFICULTY.hard.xp,
    lpReward: LP_BY_DIFFICULTY.hard.reward,
    lpPenalty: LP_BY_DIFFICULTY.hard.penalty,
    createdAt: now,
    updatedAt: now,
    criteria: [
      {
        id: "criterion-portfolio-1",
        questId: "quest-main-portfolio",
        title: "Publish homepage redesign",
        description: "Hero, navigation, and responsive project preview section.",
        type: "standalone",
        targetCount: 1,
        currentCount: 1,
        isCompleted: true,
        completedAt: "2026-05-13T18:00:00.000Z",
        createdAt: now,
        updatedAt: now
      },
      {
        id: "criterion-portfolio-2",
        questId: "quest-main-portfolio",
        title: "Write two case studies",
        description: "One frontend project and one full-stack project.",
        type: "count",
        targetCount: 2,
        currentCount: 0,
        isCompleted: false,
        deadline: "2026-05-24T20:00:00.000Z",
        createdAt: now,
        updatedAt: now
      },
      {
        id: "criterion-portfolio-3",
        questId: "quest-main-portfolio",
        title: "Deploy and smoke test",
        description: "Production deploy, form test, Lighthouse pass.",
        type: "standalone",
        targetCount: 1,
        currentCount: 0,
        isCompleted: false,
        deadline: "2026-05-30T20:00:00.000Z",
        createdAt: now,
        updatedAt: now
      }
    ],
    rewards: [],
    stakes: [],
    reviewNotes: []
  },
  {
    id: "quest-main-sleep",
    ownerId: mockProfile.id,
    title: "Stabilize sleep schedule",
    description:
      "Build a consistent sleep routine that makes mornings usable instead of heroic.",
    type: "main",
    difficulty: "medium",
    status: "pending_verification",
    skillCategory: "health",
    lifeCategory: "health",
    deadline: "2026-05-22T21:00:00.000Z",
    failureCondition: "Three missed bedtime windows in a week.",
    rewardText: "Buy a new pillow.",
    stakeText: "Skip energy drinks for a week.",
    proofRequired: true,
    verifierId: mockFriend.id,
    visibility: "friends",
    xpReward: LP_BY_DIFFICULTY.medium.xp,
    lpReward: LP_BY_DIFFICULTY.medium.reward,
    lpPenalty: LP_BY_DIFFICULTY.medium.penalty,
    createdAt: now,
    updatedAt: now,
    criteria: [
      {
        id: "criterion-sleep-1",
        questId: "quest-main-sleep",
        title: "Bed before 23:30 for five nights",
        type: "count",
        targetCount: 5,
        currentCount: 5,
        isCompleted: true,
        completedAt: "2026-05-15T21:20:00.000Z",
        createdAt: now,
        updatedAt: now
      },
      {
        id: "criterion-sleep-2",
        questId: "quest-main-sleep",
        title: "No phone in bed",
        type: "standalone",
        targetCount: 1,
        currentCount: 1,
        isCompleted: true,
        completedAt: "2026-05-15T21:20:00.000Z",
        createdAt: now,
        updatedAt: now
      }
    ],
    rewards: [],
    stakes: [],
    reviewNotes: []
  },
  {
    id: "quest-side-gym",
    ownerId: mockProfile.id,
    title: "Gym session",
    description: "One focused session: push day plus ten minutes of stretching.",
    type: "side",
    difficulty: "easy",
    status: "active",
    skillCategory: "fitness",
    lifeCategory: "health",
    deadline: "2026-05-17T18:00:00.000Z",
    proofRequired: false,
    visibility: "private",
    xpReward: LP_BY_DIFFICULTY.easy.xp,
    lpReward: LP_BY_DIFFICULTY.easy.reward,
    lpPenalty: LP_BY_DIFFICULTY.easy.penalty,
    createdAt: now,
    updatedAt: now,
    criteria: [
      {
        id: "criterion-gym-1",
        questId: "quest-side-gym",
        title: "Finish planned workout",
        type: "standalone",
        targetCount: 1,
        currentCount: 0,
        isCompleted: false,
        createdAt: now,
        updatedAt: now
      }
    ],
    rewards: [],
    stakes: [],
    reviewNotes: []
  },
  {
    id: "quest-side-room",
    ownerId: mockProfile.id,
    title: "Reset room",
    description: "Clear desk, laundry, trash, and cables.",
    type: "side",
    difficulty: "easy",
    status: "active",
    skillCategory: "discipline",
    lifeCategory: "social",
    deadline: "2026-05-16T19:00:00.000Z",
    proofRequired: true,
    verifierId: mockFriend.id,
    visibility: "friends",
    xpReward: LP_BY_DIFFICULTY.easy.xp,
    lpReward: LP_BY_DIFFICULTY.easy.reward,
    lpPenalty: LP_BY_DIFFICULTY.easy.penalty,
    createdAt: now,
    updatedAt: now,
    criteria: [
      {
        id: "criterion-room-1",
        questId: "quest-side-room",
        title: "Desk clear",
        type: "standalone",
        targetCount: 1,
        currentCount: 1,
        isCompleted: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "criterion-room-2",
        questId: "quest-side-room",
        title: "Laundry done",
        type: "standalone",
        targetCount: 1,
        currentCount: 0,
        isCompleted: false,
        createdAt: now,
        updatedAt: now
      }
    ],
    rewards: [],
    stakes: [],
    reviewNotes: []
  }
];

export const mockSkills: SkillProgress[] = [
  {
    id: "skill-programming",
    userId: mockProfile.id,
    skillCategory: "programming",
    xp: 480,
    level: 5,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "skill-fitness",
    userId: mockProfile.id,
    skillCategory: "fitness",
    xp: 260,
    level: 3,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "skill-discipline",
    userId: mockProfile.id,
    skillCategory: "discipline",
    xp: 340,
    level: 4,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "skill-health",
    userId: mockProfile.id,
    skillCategory: "health",
    xp: 180,
    level: 2,
    createdAt: now,
    updatedAt: now
  }
];
