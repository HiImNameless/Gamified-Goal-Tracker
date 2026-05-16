import type { LifeCategory, QuestDifficulty } from "@/lib/types";

export const LIFE_CATEGORIES: LifeCategory[] = ["health", "wealth", "social"];

export const lifeCategoryLabels: Record<LifeCategory, string> = {
  health: "Health",
  wealth: "Wealth",
  social: "Social"
};

export const lifeCategoryColors: Record<
  LifeCategory,
  {
    text: string;
    border: string;
    bg: string;
    ring: string;
  }
> = {
  health: {
    text: "text-emerald-300",
    border: "border-emerald-400/35",
    bg: "bg-emerald-400/10",
    ring: "#34d399"
  },
  wealth: {
    text: "text-amber-300",
    border: "border-amber-400/35",
    bg: "bg-amber-400/10",
    ring: "#fbbf24"
  },
  social: {
    text: "text-sky-300",
    border: "border-sky-400/35",
    bg: "bg-sky-400/10",
    ring: "#38bdf8"
  }
};

export const LIFE_CATEGORY_COMPLETION_POINTS: Record<QuestDifficulty, number> = {
  easy: 4,
  medium: 8,
  hard: 14,
  boss: 24
};

export const LIFE_CATEGORY_FAILURE_POINTS: Record<QuestDifficulty, number> = {
  easy: -8,
  medium: -14,
  hard: -24,
  boss: -40
};

export const LIFE_CATEGORY_DECAY_RULES = {
  baseDailyLoss: 2,
  firstEscalationDays: 7,
  firstEscalationDailyLoss: 4,
  secondEscalationDays: 14,
  secondEscalationDailyLoss: 6
};

export function clampLifeCategoryPoints(points: number) {
  return Math.min(100, Math.max(0, Math.round(points)));
}

export function getDecayRate(daysNeglected: number) {
  if (daysNeglected >= LIFE_CATEGORY_DECAY_RULES.secondEscalationDays) {
    return LIFE_CATEGORY_DECAY_RULES.secondEscalationDailyLoss;
  }

  if (daysNeglected >= LIFE_CATEGORY_DECAY_RULES.firstEscalationDays) {
    return LIFE_CATEGORY_DECAY_RULES.firstEscalationDailyLoss;
  }

  return LIFE_CATEGORY_DECAY_RULES.baseDailyLoss;
}

export function getDaysBetween(startIso: string, end = new Date()) {
  const start = new Date(startIso);
  const diff = end.getTime() - start.getTime();
  return Math.max(0, Math.floor(diff / 86_400_000));
}

export function getLifeCategoryDecayAmount({
  lastCompletedAt,
  lastDecayAppliedAt,
  createdAt,
  now = new Date()
}: {
  lastCompletedAt?: string;
  lastDecayAppliedAt: string;
  createdAt: string;
  now?: Date;
}) {
  const daysToApply = getDaysBetween(lastDecayAppliedAt, now);
  const neglectAnchor = lastCompletedAt ?? createdAt;
  let amount = 0;

  for (let day = 1; day <= daysToApply; day += 1) {
    const appliedDay = new Date(new Date(lastDecayAppliedAt).getTime() + day * 86_400_000);
    amount += getDecayRate(getDaysBetween(neglectAnchor, appliedDay));
  }

  return amount;
}
