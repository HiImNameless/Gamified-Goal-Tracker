import Link from "next/link";
import { CalendarClock, CheckCircle2, ShieldCheck, Swords } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Quest } from "@/lib/types";
import {
  difficultyLabels,
  getQuestProgress,
  getTimeRemaining,
  skillLabels,
  statusLabels
} from "@/lib/quest-utils";
import { cn } from "@/lib/utils";

const difficultyTone = {
  easy: "success",
  medium: "default",
  hard: "warning",
  boss: "danger"
} as const;

interface QuestCardProps {
  quest: Quest;
}

export function QuestCard({ quest }: QuestCardProps) {
  const progress = getQuestProgress(quest);

  return (
    <Link href={`/quests/${quest.id}`} className="block">
      <Card className="group border-border/80 bg-card/78 transition hover:border-primary/50 hover:shadow-glow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-2">
              <div className="flex items-center gap-2">
                {quest.type === "boss" ? (
                  <Swords className="h-4 w-4 text-red-300" />
                ) : (
                  <ShieldCheck className="h-4 w-4 text-primary" />
                )}
                <h3 className="truncate text-sm font-semibold text-foreground">
                  {quest.title}
                </h3>
              </div>
              <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                {quest.description}
              </p>
            </div>
            <Badge tone={difficultyTone[quest.difficulty]}>
              {difficultyLabels[quest.difficulty]}
            </Badge>
          </div>

          <div className="mt-4 space-y-2">
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

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge
              tone={
                quest.status === "pending_verification"
                  ? "warning"
                  : quest.status === "active"
                    ? "success"
                    : "muted"
              }
            >
              {statusLabels[quest.status]}
            </Badge>
            <Badge tone="muted">{skillLabels[quest.skillCategory]}</Badge>
            <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5" />
              {getTimeRemaining(quest.deadline)}
            </span>
          </div>

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
        </CardContent>
      </Card>
    </Link>
  );
}
