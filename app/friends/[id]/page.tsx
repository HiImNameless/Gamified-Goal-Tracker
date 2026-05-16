import Link from "next/link";
import { ArrowLeft, CalendarClock, CheckCircle2, Flame, ShieldCheck } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { requireUser } from "@/lib/auth";
import { getFriendProfileData } from "@/lib/friends";
import {
  difficultyLabels,
  getQuestProgress,
  getReviewStatus,
  getTimeRemaining,
  statusLabels
} from "@/lib/quest-utils";
import { getRankName } from "@/lib/ranks";
import { getDashboardData } from "@/lib/supabase/queries";
import type { Quest } from "@/lib/types";

interface FriendProfilePageProps {
  params: {
    id: string;
  };
}

export default async function FriendProfilePage({ params }: FriendProfilePageProps) {
  const user = await requireUser();
  const [{ profile }, friendData] = await Promise.all([
    getDashboardData(user.id),
    getFriendProfileData(user.id, params.id)
  ]);

  if (!profile) {
    redirect("/profile/setup");
  }

  if (!friendData) {
    notFound();
  }

  const progress = friendData.progress ?? {
    rankTier: 0,
    lp: 0,
    totalXp: 0,
    completedQuests: 0,
    failedQuests: 0,
    currentStreak: 0,
    longestStreak: 0
  };
  const activeQuests = friendData.quests.filter((quest) =>
    ["active", "pending_verification"].includes(quest.status)
  );
  const completedQuests = friendData.quests
    .filter((quest) => quest.status === "completed")
    .slice(0, 4);
  const mainCount = activeQuests.filter((quest) => quest.type === "main").length;
  const sideCount = activeQuests.filter((quest) => quest.type === "side").length;

  return (
    <div className="flex min-h-screen">
      <Sidebar profile={profile} />

      <main className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <Button variant="ghost">
            <Link href="/friends" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to friends
            </Link>
          </Button>

          <section className="rounded-lg border border-border bg-card/80 p-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-md border border-border bg-secondary text-xl font-bold text-primary">
                  {friendData.profile.displayName.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="truncate text-3xl font-bold">
                      {friendData.profile.displayName}
                    </h1>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-300">
                      <Flame className="h-4 w-4" />
                      {progress.currentStreak}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Target quest: Not selected
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <ProfileStat label="Rank" value={getRankName(progress.rankTier)} detail={`${progress.lp} LP`} />
                <ProfileStat label="Active Main" value={mainCount.toString()} detail="M quests" />
                <ProfileStat label="Active Side" value={sideCount.toString()} detail="S quests" />
              </div>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Visible Active Quests</h2>
                <Badge tone="muted">{activeQuests.length} Active</Badge>
              </div>

              <div className="grid gap-4">
                {activeQuests.length > 0 ? (
                  activeQuests.map((quest) => <FriendQuestCard key={quest.id} quest={quest} />)
                ) : (
                  <div className="rounded-lg border border-dashed border-border bg-card/45 p-6 text-sm text-muted-foreground">
                    No visible active quests right now.
                  </div>
                )}
              </div>
            </section>

            <aside className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <Progress value={progress.lp} />
                  <div className="flex justify-between text-muted-foreground">
                    <span>{progress.lp}/100 LP</span>
                    <span>{progress.totalXp} XP</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <MiniStat label="Completed" value={progress.completedQuests} />
                    <MiniStat label="Failed" value={progress.failedQuests} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Recently Completed</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {completedQuests.length > 0 ? (
                    completedQuests.map((quest) => (
                      <div
                        key={quest.id}
                        className="rounded-md border border-border bg-secondary/40 p-3"
                      >
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold">
                              {quest.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              +{quest.lpReward} LP
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No completed visible quests yet.
                    </p>
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

function FriendQuestCard({ quest }: { quest: Quest }) {
  const progress = getQuestProgress(quest);
  const reviewStatus = getReviewStatus(quest);

  return (
    <Card className="border-border/80 bg-card/78">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={quest.type === "main" ? "warning" : "default"}>
                {quest.type === "main" ? "Main" : "Side"}
              </Badge>
              <Badge tone="muted">{difficultyLabels[quest.difficulty]}</Badge>
              <Badge
                tone={quest.status === "pending_verification" ? "warning" : "success"}
              >
                {statusLabels[quest.status]}
              </Badge>
              <Badge tone={reviewStatus.tone}>{reviewStatus.label}</Badge>
            </div>
            <h3 className="truncate text-base font-semibold">{quest.title}</h3>
            <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
              {quest.description}
            </p>
          </div>

          <div className="shrink-0 rounded-md border border-border bg-secondary/40 p-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarClock className="h-4 w-4" />
              Deadline
            </div>
            <div className="mt-1 font-semibold">{getTimeRemaining(quest.deadline)}</div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{progress}% complete</span>
            <span>
              {quest.criteria.filter((item) => item.isCompleted).length}/
              {quest.criteria.length} criteria
            </span>
          </div>
          <Progress value={progress} />
        </div>
      </CardContent>
    </Card>
  );
}

function ProfileStat({
  label,
  value,
  detail
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-md border border-border bg-secondary/40 p-3">
      <div className="text-[11px] font-semibold uppercase text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-primary">{value}</div>
      <div className="text-xs text-muted-foreground">{detail}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border bg-secondary/40 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}
