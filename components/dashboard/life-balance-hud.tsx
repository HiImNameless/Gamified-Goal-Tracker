import { HeartPulse, Users, WalletCards } from "lucide-react";
import {
  LIFE_CATEGORIES,
  getDaysBetween,
  getDecayRate,
  lifeCategoryColors,
  lifeCategoryLabels
} from "@/lib/life-categories";
import { cn } from "@/lib/utils";
import type { LifeCategory, LifeCategoryProgress } from "@/lib/types";

const categoryIcons = {
  health: HeartPulse,
  wealth: WalletCards,
  social: Users
};

interface LifeBalanceHudProps {
  categories: LifeCategoryProgress[];
  layout?: "row" | "stack";
}

export function LifeBalanceHud({ categories, layout = "row" }: LifeBalanceHudProps) {
  const categoryByName = new Map(categories.map((category) => [category.category, category]));

  return (
    <div className={cn("grid gap-3", layout === "row" && "sm:grid-cols-3")}>
      {LIFE_CATEGORIES.map((category) => {
        const progress = categoryByName.get(category);
        const points = progress?.points ?? 0;
        const lastCompletedAt = progress?.lastCompletedAt;
        const daysSinceCompletion = lastCompletedAt ? getDaysBetween(lastCompletedAt) : null;
        const decayRate = getDecayRate(
          getDaysBetween(lastCompletedAt ?? progress?.createdAt ?? new Date().toISOString())
        );

        return (
          <LifeCategoryRing
            key={category}
            category={category}
            points={points}
            daysSinceCompletion={daysSinceCompletion}
            decayRate={decayRate}
          />
        );
      })}
    </div>
  );
}

function LifeCategoryRing({
  category,
  points,
  daysSinceCompletion,
  decayRate
}: {
  category: LifeCategory;
  points: number;
  daysSinceCompletion: number | null;
  decayRate: number;
}) {
  const Icon = categoryIcons[category];
  const colors = lifeCategoryColors[category];
  const circumference = 2 * Math.PI * 38;
  const offset = circumference - (points / 100) * circumference;

  return (
    <div
      className={cn(
        "rounded-lg border bg-secondary/35 p-3",
        colors.border,
        colors.bg
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative h-20 w-20 shrink-0">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 90 90">
            <circle
              cx="45"
              cy="45"
              r="38"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-background/80"
            />
            <circle
              cx="45"
              cy="45"
              r="38"
              fill="none"
              stroke={colors.ring}
              strokeLinecap="round"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <Icon className={cn("h-7 w-7", colors.text)} />
          </div>
        </div>

        <div className="min-w-0">
          <div className="text-sm font-semibold">{lifeCategoryLabels[category]}</div>
          <div className={cn("mt-1 text-2xl font-bold", colors.text)}>{points}</div>
          <div className="mt-1 text-xs leading-5 text-muted-foreground">
            Last:{" "}
            {daysSinceCompletion === null
              ? "never"
              : daysSinceCompletion === 0
                ? "today"
                : `${daysSinceCompletion}d ago`}
            <br />
            Decay: -{decayRate}/day
          </div>
        </div>
      </div>
    </div>
  );
}
