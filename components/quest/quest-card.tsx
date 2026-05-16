import Link from "next/link";
import {
  CalendarClock,
  Flag,
  HeartPulse,
  Swords,
  Target,
  Users,
  WalletCards
} from "lucide-react";
import { QuestActionButtons } from "@/components/quest/quest-action-buttons";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Quest } from "@/lib/types";
import {
  LIFE_CATEGORY_COMPLETION_POINTS,
  lifeCategoryColors,
  lifeCategoryLabels
} from "@/lib/life-categories";
import {
  difficultyLabels,
  getQuestProgress,
  getReviewStatus,
  getTimeRemaining,
  statusLabels
} from "@/lib/quest-utils";
import { cn } from "@/lib/utils";

const difficultyTone = {
  easy: "success",
  medium: "default",
  hard: "warning",
  boss: "danger"
} as const;

const categoryIcons = {
  health: HeartPulse,
  wealth: WalletCards,
  social: Users
};

interface QuestCardProps {
  quest: Quest;
  isTracked?: boolean;
  canManage?: boolean;
}

export function QuestCard({ quest, isTracked = false, canManage = false }: QuestCardProps) {
  const progress = getQuestProgress(quest);
  const reviewStatus = getReviewStatus(quest);
  const CategoryIcon = categoryIcons[quest.lifeCategory];
  const categoryColors = lifeCategoryColors[quest.lifeCategory];
  const isCompleted = quest.status === "completed";
  const isNegativeOutcome = quest.status === "failed" || quest.status === "forfeited";
  const outcomeColors = isNegativeOutcome
    ? {
        text: "text-red-300",
        border: "border-red-400/45",
        glow: "shadow-[0_0_32px_rgba(248,113,113,0.26)]"
      }
    : categoryColors;
  const canShowActions = canManage && quest.status === "active";
  const canForfeit = canManage && quest.status === "active";
  const categoryGain = LIFE_CATEGORY_COMPLETION_POINTS[quest.difficulty];
  const isOutcome = isCompleted || isNegativeOutcome;

  return (
      <Card
        className={cn(
          "group relative overflow-hidden bg-card/78 transition hover:border-primary/50 hover:shadow-glow",
          outcomeColors.border,
          isTracked && categoryColors.glow,
          isCompleted && "shadow-[0_0_32px_rgba(16,185,129,0.24)]",
          isNegativeOutcome && outcomeColors.glow
        )}
      >
        <Link href={`/quests/${quest.id}`} className="block">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {quest.type === "main" ? (
                  <Target
                    className={cn(
                      "h-5 w-5",
                      isOutcome
                        ? outcomeColors.text
                        : isTracked
                          ? "text-amber-300"
                          : "text-muted-foreground"
                    )}
                  />
                ) : quest.type === "boss" ? (
                  <Swords className="h-5 w-5 text-red-300" />
                ) : (
                  <Flag
                    className={cn(
                      "h-5 w-5",
                      isOutcome
                        ? outcomeColors.text
                        : isTracked
                          ? "text-amber-300"
                          : "text-muted-foreground"
                    )}
                  />
                )}
                <CategoryIcon className={cn("h-4 w-4", categoryColors.text)} />
                <h3 className="truncate text-sm font-semibold text-foreground">
                  {quest.title}
                </h3>
                {isOutcome ? (
                  <>
                    <Badge tone={isNegativeOutcome ? "danger" : "success"}>
                      {statusLabels[quest.status]}
                    </Badge>
                    <Badge tone={reviewStatus.tone}>{reviewStatus.label}</Badge>
                    <Badge tone="muted">
                      <CategoryIcon className={cn("mr-1 h-3 w-3", categoryColors.text)} />
                      {lifeCategoryLabels[quest.lifeCategory]}
                    </Badge>
                  </>
                ) : null}
              </div>
              <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                {quest.description}
              </p>
            </div>
            <div
              className={cn(
                "flex shrink-0 items-center gap-2 transition-transform duration-200",
                canShowActions && "group-hover:-translate-x-24"
              )}
            >
              <Badge tone={difficultyTone[quest.difficulty]}>
                {difficultyLabels[quest.difficulty]}
              </Badge>
            </div>
          </div>

          <div className={cn("mt-4 space-y-2", isOutcome && "mt-2")}>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{progress}% complete</span>
              <span>{quest.criteria.filter((item) => item.isCompleted).length}/{quest.criteria.length} criteria</span>
            </div>
            <Progress
              value={progress}
              indicatorClassName={cn(
                quest.status === "pending_verification" && "bg-amber-400",
                quest.status === "completed" && "bg-emerald-400"
              )}
            />
          </div>

          {!isOutcome ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge
              tone={
                quest.status === "pending_verification"
                  ? "warning"
                  : quest.status === "active"
                    ? "success"
                    : quest.status === "completed"
                      ? "success"
                      : quest.status === "forfeited"
                        ? "danger"
                    : "muted"
              }
            >
              {statusLabels[quest.status]}
            </Badge>
            <Badge tone={reviewStatus.tone}>{reviewStatus.label}</Badge>
            <Badge tone="muted">
              <CategoryIcon className={cn("mr-1 h-3 w-3", categoryColors.text)} />
              {lifeCategoryLabels[quest.lifeCategory]}
            </Badge>
              <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarClock className="h-3.5 w-3.5" />
                {getTimeRemaining(quest.deadline)}
              </span>
            </div>
          ) : null}

          {isOutcome ? (
            <div className="mt-3 grid gap-2 text-xs sm:grid-cols-3">
              <CompactResult
                label="LP Result"
                value={
                  isNegativeOutcome
                    ? `${quest.lpPenalty} LP`
                    : `+${quest.lpReward} LP`
                }
                valueClassName={isNegativeOutcome ? "text-red-300" : "text-primary"}
              />
              <CompactResult
                label={isNegativeOutcome ? "Loss" : "Reward"}
                value={
                  isNegativeOutcome
                    ? quest.stakes[0]?.title ?? "Not set"
                    : quest.rewards[0]?.title ?? "Not set"
                }
              />
              <CompactResult
                label={lifeCategoryLabels[quest.lifeCategory]}
                value={isNegativeOutcome ? "Penalty applied" : `+${categoryGain}`}
                valueClassName={isNegativeOutcome ? "text-red-300" : undefined}
              />
            </div>
          ) : (
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-md border border-border bg-secondary/60 p-2">
              <div className="text-muted-foreground">Win</div>
              <div className="font-semibold text-primary">+{quest.lpReward} LP</div>
            </div>
            <div className="rounded-md border border-border bg-secondary/60 p-2">
              <div className="text-muted-foreground">Risk</div>
              <div className="font-semibold text-red-300">{quest.lpPenalty} LP</div>
            </div>
            <div className="rounded-md border border-border bg-secondary/60 p-2">
              <div className="text-muted-foreground">Proof</div>
              <div className="font-semibold text-foreground">
                {quest.proofRequired ? "Yes" : "No"}
              </div>
            </div>
          </div>
          )}
        </CardContent>
        </Link>
        {canShowActions ? (
          <div className="absolute right-3 top-4 translate-x-[130%] opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
            <QuestActionButtons
              questId={quest.id}
              isTracked={isTracked}
              canTrack
              canForfeit={canForfeit}
              compact
            />
          </div>
        ) : null}
      </Card>
  );
}

function CompactResult({
  label,
  value,
  valueClassName
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-md border border-border bg-secondary/45 px-3 py-2">
      <div className="text-muted-foreground">{label}</div>
      <div className={cn("truncate font-semibold text-foreground", valueClassName)}>
        {value}
      </div>
    </div>
  );
}
