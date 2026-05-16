import type { Quest, QuestDifficulty, QuestStatus, SkillCategory } from "@/lib/types";
import { LP_BY_DIFFICULTY } from "@/lib/ranks";

export const difficultyLabels: Record<QuestDifficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  boss: "Boss"
};

export const statusLabels: Record<QuestStatus, string> = {
  draft: "Draft",
  active: "Active",
  pending_verification: "Pending Verification",
  completed: "Completed",
  failed: "Failed",
  forfeited: "Forfeited",
  abandoned: "Abandoned",
  expired: "Expired"
};

export const skillLabels: Record<SkillCategory, string> = {
  health: "Health",
  fitness: "Fitness",
  programming: "Programming",
  editing: "Editing",
  study: "Study",
  money: "Money",
  creativity: "Creativity",
  discipline: "Discipline"
};

export function getQuestProgress(quest: Quest) {
  if (quest.criteria.length === 0) {
    return quest.status === "completed" ? 100 : 0;
  }

  const completed = quest.criteria.filter((criterion) => criterion.isCompleted).length;
  return Math.round((completed / quest.criteria.length) * 100);
}

export function getTimeRemaining(deadline?: string) {
  if (!deadline) {
    return "No deadline";
  }

  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) {
    return "Expired";
  }

  const hours = Math.ceil(diff / (1000 * 60 * 60));
  if (hours < 24) {
    return `${hours}h left`;
  }

  const days = Math.ceil(hours / 24);
  return `${days}d left`;
}

export function getQuestEconomy(difficulty: QuestDifficulty) {
  return LP_BY_DIFFICULTY[difficulty];
}

export function getReviewStatus(quest: Quest) {
  const latestReview = [...quest.reviewNotes].reverse().find((note) =>
    ["approved", "rejected", "pending"].includes(note.status)
  );

  if (latestReview?.status === "approved" || quest.status === "completed") {
    return {
      label: "Verified",
      tone: "success" as const
    };
  }

  if (latestReview?.status === "rejected") {
    return {
      label: "Rejected",
      tone: "danger" as const
    };
  }

  if (quest.status === "pending_verification") {
    return {
      label: "In Review",
      tone: "warning" as const
    };
  }

  return {
    label: "Unverified",
    tone: "muted" as const
  };
}
