import Link from "next/link";
import { ArrowLeft, CalendarClock, CheckCircle2, Circle, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { requireUser } from "@/lib/auth";
import {
  difficultyLabels,
  getQuestProgress,
  getTimeRemaining,
  skillLabels,
  statusLabels
} from "@/lib/quest-utils";
import { getQuestForUser } from "@/lib/supabase/queries";

interface QuestDetailPageProps {
  params: {
    id: string;
  };
}

export default async function QuestDetailPage({ params }: QuestDetailPageProps) {
  const user = await requireUser();
  const quest = await getQuestForUser(params.id, user.id);

  if (!quest) {
    notFound();
  }

  const progress = getQuestProgress(quest);

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Button variant="ghost">
          <Link href="/" className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to board
          </Link>
        </Button>

        <section className="rounded-lg border border-border bg-card/80 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge>{difficultyLabels[quest.difficulty]}</Badge>
                <Badge tone="muted">{statusLabels[quest.status]}</Badge>
                <Badge tone="muted">{skillLabels[quest.skillCategory]}</Badge>
              </div>
              <h1 className="text-3xl font-bold">{quest.title}</h1>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                {quest.description}
              </p>
            </div>
            <div className="rounded-md border border-border bg-secondary/50 p-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarClock className="h-4 w-4" />
                Deadline
              </div>
              <div className="mt-1 font-semibold">{getTimeRemaining(quest.deadline)}</div>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Quest Progress</span>
              <span className="text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <Card>
            <CardHeader>
              <CardTitle>Success Criteria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quest.criteria.map((criterion) => (
                <div
                  key={criterion.id}
                  className="flex gap-3 rounded-md border border-border bg-secondary/40 p-4"
                >
                  {criterion.isCompleted ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  ) : (
                    <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  )}
                  <div>
                    <div className="font-medium">{criterion.title}</div>
                    {criterion.description ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {criterion.description}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rewards & Stakes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="rounded-md border border-border bg-secondary/40 p-3">
                  <div className="text-muted-foreground">LP Reward</div>
                  <div className="font-semibold text-primary">+{quest.lpReward} LP</div>
                </div>
                <div className="rounded-md border border-border bg-secondary/40 p-3">
                  <div className="text-muted-foreground">LP Penalty</div>
                  <div className="font-semibold text-red-300">{quest.lpPenalty} LP</div>
                </div>
                <div className="rounded-md border border-border bg-secondary/40 p-3">
                  <div className="text-muted-foreground">Reward</div>
                  <div className="font-semibold">{quest.rewardText ?? "Not set"}</div>
                </div>
                <div className="rounded-md border border-border bg-secondary/40 p-3">
                  <div className="text-muted-foreground">Stake</div>
                  <div className="font-semibold">{quest.stakeText ?? "Not set"}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  {quest.proofRequired
                    ? "Proof is required before LP is awarded."
                    : "This quest can be completed directly."}
                </p>
                <Button className="w-full" variant="accent">
                  Submit Proof
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
