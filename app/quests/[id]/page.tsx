import Link from "next/link";
import { ArrowLeft, CalendarClock, CheckCircle2, Circle, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import {
  completeQuestAction,
  submitProofAction,
  toggleCriteriaAction
} from "@/app/quests/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
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
  const canSubmitProof =
    progress === 100 && quest.proofRequired && quest.status === "active";
  const canCompleteDirectly =
    progress === 100 && !quest.proofRequired && quest.status === "active";

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
                <form
                  key={criterion.id}
                  action={toggleCriteriaAction}
                  className="flex gap-3 rounded-md border border-border bg-secondary/40 p-4"
                >
                  <input type="hidden" name="criteria_id" value={criterion.id} />
                  <input type="hidden" name="quest_id" value={quest.id} />
                  {criterion.isCompleted ? (
                    <input type="hidden" name="is_completed" value="on" />
                  ) : null}
                  <button
                    type="submit"
                    className="mt-0.5 h-5 w-5 shrink-0 text-left"
                    aria-label={
                      criterion.isCompleted
                        ? "Mark criterion incomplete"
                        : "Mark criterion complete"
                    }
                  >
                    {criterion.isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                  <div className="min-w-0">
                    <div className="font-medium">{criterion.title}</div>
                    {criterion.type === "count" ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {criterion.currentCount}/{criterion.targetCount} completed
                      </p>
                    ) : null}
                    {criterion.description ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {criterion.description}
                      </p>
                    ) : null}
                  </div>
                </form>
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
                <StructuredItems label="Rewards" items={quest.rewards} />
                <StructuredItems label="Stakes" items={quest.stakes} />
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
                  {getVerificationMessage(quest.proofRequired, quest.status, progress)}
                </p>
                {canSubmitProof ? (
                  <form className="space-y-3" action={submitProofAction}>
                    <input type="hidden" name="quest_id" value={quest.id} />
                    <Textarea
                      name="proof_text"
                      placeholder="What did you complete? Add notes for your verifier."
                    />
                    <InputFile />
                    <Button className="w-full" variant="accent" type="submit">
                      Submit Proof
                    </Button>
                  </form>
                ) : null}
                {canCompleteDirectly ? (
                  <form action={completeQuestAction}>
                    <input type="hidden" name="quest_id" value={quest.id} />
                    <Button className="w-full" variant="accent" type="submit">
                      Complete Quest
                    </Button>
                  </form>
                ) : null}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}

function getVerificationMessage(
  proofRequired: boolean,
  status: string,
  progress: number
) {
  if (status === "completed") {
    return "Quest completed. LP has been awarded.";
  }

  if (status === "pending_verification") {
    return "Proof submitted. This quest is waiting for verifier approval.";
  }

  if (!proofRequired) {
    return "This quest completes automatically when every criterion is checked.";
  }

  if (progress === 100) {
    return "All criteria are complete. Submit proof to move this quest into verification.";
  }

  return "Proof is required after all criteria are complete.";
}

function InputFile() {
  return (
    <input
      className="block w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-primary-foreground"
      name="proof_file"
      type="file"
      accept="image/*,.pdf,.txt,.md,.doc,.docx"
    />
  );
}

function StructuredItems({
  label,
  items
}: {
  label: string;
  items: { id: string; title: string }[];
}) {
  return (
    <div className="rounded-md border border-border bg-secondary/40 p-3">
      <div className="text-muted-foreground">{label}</div>
      {items.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {items.map((item) => (
            <li key={item.id} className="font-semibold">
              {item.title}
            </li>
          ))}
        </ul>
      ) : (
        <div className="font-semibold">Not set</div>
      )}
    </div>
  );
}
