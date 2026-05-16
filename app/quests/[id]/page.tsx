import Link from "next/link";
import {
  ArrowLeft,
  CalendarClock,
  HeartPulse,
  ShieldCheck,
  Users,
  WalletCards
} from "lucide-react";
import { notFound, redirect } from "next/navigation";
import {
  completeQuestAction,
  submitProofAction
} from "@/app/quests/actions";
import { CriteriaEditor } from "@/components/quest/criteria-editor";
import { QuestActionButtons } from "@/components/quest/quest-action-buttons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Sidebar } from "@/components/dashboard/sidebar";
import { requireUser } from "@/lib/auth";
import {
  difficultyLabels,
  getQuestProgress,
  getReviewStatus,
  getTimeRemaining,
  statusLabels
} from "@/lib/quest-utils";
import {
  LIFE_CATEGORY_COMPLETION_POINTS,
  LIFE_CATEGORY_FAILURE_POINTS,
  lifeCategoryColors,
  lifeCategoryLabels
} from "@/lib/life-categories";
import { getQuestForUser } from "@/lib/supabase/queries";
import { getDashboardData } from "@/lib/supabase/queries";
import { cn } from "@/lib/utils";

interface QuestDetailPageProps {
  params: {
    id: string;
  };
}

const categoryIcons = {
  health: HeartPulse,
  wealth: WalletCards,
  social: Users
};

export default async function QuestDetailPage({ params }: QuestDetailPageProps) {
  const user = await requireUser();
  const [{ profile, progress: userProgress }, quest] = await Promise.all([
    getDashboardData(user.id),
    getQuestForUser(params.id, user.id)
  ]);

  if (!profile) {
    redirect("/profile/setup");
  }

  if (!quest) {
    notFound();
  }

  const progress = getQuestProgress(quest);
  const isOwner = quest.ownerId === user.id;
  const canSubmitProof =
    isOwner && progress === 100 && quest.proofRequired && quest.status === "active";
  const canCompleteDirectly =
    isOwner && progress === 100 && !quest.proofRequired && quest.status === "active";
  const reviewStatus = getReviewStatus(quest);
  const CategoryIcon = categoryIcons[quest.lifeCategory];
  const categoryColors = lifeCategoryColors[quest.lifeCategory];
  const categoryGain = LIFE_CATEGORY_COMPLETION_POINTS[quest.difficulty];
  const categoryLoss = Math.abs(LIFE_CATEGORY_FAILURE_POINTS[quest.difficulty]);
  const isTracked = userProgress?.trackedQuestId === quest.id;

  return (
    <div className="flex min-h-screen">
      <Sidebar profile={profile} />

      <main className="w-full px-4 py-6 sm:px-6 lg:px-8">
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
                <Badge tone={reviewStatus.tone}>{reviewStatus.label}</Badge>
                <Badge tone="muted">
                  <CategoryIcon className={cn("mr-1 h-3 w-3", categoryColors.text)} />
                  {lifeCategoryLabels[quest.lifeCategory]}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold">{quest.title}</h1>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                {quest.description}
              </p>
              {isOwner ? (
                <QuestActionButtons
                  questId={quest.id}
                  isTracked={isTracked}
                  canTrack={quest.status === "active"}
                  canForfeit={quest.status === "active"}
                />
              ) : null}
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
              <CriteriaEditor
                questId={quest.id}
                criteria={quest.criteria}
                canEdit={isOwner && quest.status === "active"}
              />
            </CardContent>
          </Card>

          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rewards & Stakes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <ImpactBlock
                    label="LP"
                    value={`${quest.lpReward}/${Math.abs(quest.lpPenalty)}`}
                    helper="Gain / Loss"
                  />
                  <ImpactBlock
                    label={lifeCategoryLabels[quest.lifeCategory]}
                    value={`${categoryGain}/${categoryLoss}`}
                    helper="Gain / Loss"
                    icon={<CategoryIcon className={cn("h-4 w-4", categoryColors.text)} />}
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <StructuredItems label="Rewards" items={quest.rewards} />
                  <StructuredItems label="Stakes" items={quest.stakes} />
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

            <Card>
              <CardHeader>
                <CardTitle>Reviewer Comments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {quest.reviewNotes.filter((note) => note.reviewerComment).length > 0 ? (
                  quest.reviewNotes
                    .filter((note) => note.reviewerComment)
                    .map((note) => (
                      <div
                        key={note.id}
                        className="rounded-md border border-border bg-secondary/40 p-3"
                      >
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <Badge
                            tone={
                              note.status === "approved"
                                ? "success"
                                : note.status === "rejected"
                                  ? "danger"
                                  : "warning"
                            }
                          >
                            {note.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(note.reviewedAt ?? note.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="leading-6 text-muted-foreground">
                          {note.reviewerComment}
                        </p>
                      </div>
                    ))
                ) : (
                  <p className="text-muted-foreground">No reviewer comments yet.</p>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
      </main>
    </div>
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
    <div>
      <div className="text-xs font-semibold uppercase text-muted-foreground">
        {label}
      </div>
      {items.length > 0 ? (
        <ul className="mt-2 list-disc space-y-1 pl-4">
          {items.map((item) => (
            <li key={item.id} className="font-medium leading-5">
              {item.title}
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-2 text-muted-foreground">Not set</div>
      )}
    </div>
  );
}

function ImpactBlock({
  label,
  value,
  helper,
  icon
}: {
  label: string;
  value: string;
  helper: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-lg font-bold">
        <span className="text-primary">{value.split("/")[0]}</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-red-300">{value.split("/")[1]}</span>
      </div>
      <div className="text-xs text-muted-foreground">{helper}</div>
    </div>
  );
}
