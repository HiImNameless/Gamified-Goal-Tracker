import Link from "next/link";
import { ArrowLeft, Flame } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { LifeBalanceHud } from "@/components/dashboard/life-balance-hud";
import { QuestCard } from "@/components/quest/quest-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { requireUser } from "@/lib/auth";
import { getFriendProfileData } from "@/lib/friends";
import { getRankName } from "@/lib/ranks";
import { getDashboardData } from "@/lib/supabase/queries";

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
    trackedQuestId: undefined,
    totalXp: 0,
    completedQuests: 0,
    failedQuests: 0,
    currentStreak: 0,
    longestStreak: 0
  };
  const activeQuests = friendData.quests.filter((quest) =>
    ["active", "pending_verification"].includes(quest.status)
  );
  const trackedQuest = activeQuests.find((quest) => quest.id === progress.trackedQuestId);
  const visibleActiveQuests = trackedQuest
    ? activeQuests.filter((quest) => quest.id !== trackedQuest.id)
    : activeQuests;
  const mainQuests = visibleActiveQuests.filter((quest) => quest.type === "main");
  const sideQuests = visibleActiveQuests.filter((quest) => quest.type === "side");
  const recentOutcomes = friendData.quests
    .filter((quest) => ["completed", "failed", "forfeited"].includes(quest.status))
    .sort((a, b) => {
      const aTime = new Date(a.completedAt ?? a.failedAt ?? a.updatedAt).getTime();
      const bTime = new Date(b.completedAt ?? b.failedAt ?? b.updatedAt).getTime();
      return bTime - aTime;
    })
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
                <ProfileStat label="M" value={mainCount.toString()} />
                <ProfileStat label="S" value={sideCount.toString()} />
              </div>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <section className="space-y-6">
              {trackedQuest ? (
                <QuestSection
                  title="Tracked Quest"
                  badge="Focus Target"
                  badgeTone="warning"
                >
                  <QuestCard quest={trackedQuest} isTracked />
                </QuestSection>
              ) : null}

              <QuestSection title="Active Main Quests" badge="Campaign Goals">
                {mainQuests.length > 0 ? (
                  mainQuests.map((quest) => (
                    <QuestCard
                      key={quest.id}
                      quest={quest}
                      isTracked={progress.trackedQuestId === quest.id}
                    />
                  ))
                ) : (
                  <EmptyQuestState label="No visible main quests right now." />
                )}
              </QuestSection>

              <QuestSection title="Side Quests" badge="Quick Wins">
                {sideQuests.length > 0 ? (
                  sideQuests.map((quest) => (
                    <QuestCard
                      key={quest.id}
                      quest={quest}
                      isTracked={progress.trackedQuestId === quest.id}
                    />
                  ))
                ) : (
                  <EmptyQuestState label="No visible side quests right now." />
                )}
              </QuestSection>

              <QuestSection title="Recent Outcomes" badge="Quest Log">
                {recentOutcomes.length > 0 ? (
                  recentOutcomes.map((quest) => (
                    <QuestCard
                      key={quest.id}
                      quest={quest}
                      isTracked={progress.trackedQuestId === quest.id}
                    />
                  ))
                ) : (
                  <EmptyQuestState label="No visible quest outcomes yet." />
                )}
              </QuestSection>
            </section>

            <aside className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Life Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <LifeBalanceHud categories={friendData.lifeCategories} layout="stack" />
                </CardContent>
              </Card>

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
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

function QuestSection({
  title,
  badge,
  badgeTone = "muted",
  children
}: {
  title: string;
  badge: string;
  badgeTone?: "default" | "muted" | "success" | "warning" | "danger";
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Badge tone={badgeTone}>{badge}</Badge>
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function EmptyQuestState({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card/45 p-6 text-sm text-muted-foreground">
      {label}
    </div>
  );
}

function ProfileStat({
  label,
  value,
  detail
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="grid min-h-20 place-items-center rounded-md border border-border bg-secondary/40 p-3 text-center">
      <div>
      <div className="text-[11px] font-semibold uppercase text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-primary">{value}</div>
      {detail ? <div className="text-xs text-muted-foreground">{detail}</div> : null}
      </div>
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
