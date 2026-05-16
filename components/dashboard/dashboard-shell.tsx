import { CreateQuestModal } from "@/components/quest/create-quest-modal";
import { LifeBalanceHud } from "@/components/dashboard/life-balance-hud";
import { QuestCard } from "@/components/quest/quest-card";
import { RankPanel } from "@/components/dashboard/rank-panel";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Badge } from "@/components/ui/badge";
import type {
  LifeCategoryProgress,
  Profile,
  Quest,
  SkillProgress,
  UserProgress
} from "@/lib/types";
import type { VerificationItem } from "@/lib/verification";
import { DashboardVerificationPanel } from "@/components/dashboard/verification-panel";

interface DashboardShellProps {
  profile: Profile;
  progress: UserProgress;
  quests: Quest[];
  skills: SkillProgress[];
  lifeCategories: LifeCategoryProgress[];
  acceptedFriends: Profile[];
  verificationQueue: VerificationItem[];
}

export function DashboardShell({
  profile,
  progress,
  quests,
  skills,
  lifeCategories,
  acceptedFriends,
  verificationQueue
}: DashboardShellProps) {
  const activeQuests = quests.filter((quest) =>
    ["active", "pending_verification"].includes(quest.status)
  );
  const completedQuests = quests
    .filter((quest) => quest.status === "completed")
    .sort((a, b) => {
      const aTime = new Date(a.completedAt ?? a.updatedAt).getTime();
      const bTime = new Date(b.completedAt ?? b.updatedAt).getTime();
      return bTime - aTime;
    })
    .slice(0, 4);
  const mainQuests = activeQuests.filter((quest) => quest.type === "main");
  const sideQuests = activeQuests.filter((quest) => quest.type === "side");

  return (
    <div className="flex min-h-screen">
      <Sidebar profile={profile} />

      <main className="w-full px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
          <section className="min-w-0 space-y-6">
            <header className="rounded-lg border border-border bg-card/70 p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <Badge tone="default">Quest Board</Badge>
                  <h1 className="mt-3 text-3xl font-bold">Today&apos;s Campaign</h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    Player HUD for your current quest load and life balance.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-md border border-border bg-secondary/60 p-3">
                    <div className="text-lg font-bold text-primary">
                      {activeQuests.filter((quest) => quest.type === "main").length}
                    </div>
                    <div className="text-muted-foreground">Main</div>
                  </div>
                  <div className="rounded-md border border-border bg-secondary/60 p-3">
                    <div className="text-lg font-bold text-primary">
                      {activeQuests.filter((quest) => quest.type === "side").length}
                    </div>
                    <div className="text-muted-foreground">Side</div>
                  </div>
                  <div className="rounded-md border border-border bg-secondary/60 p-3">
                    <div className="text-lg font-bold text-primary">
                      {quests.filter((quest) => quest.status === "pending_verification").length}
                    </div>
                    <div className="text-muted-foreground">Review</div>
                  </div>
                </div>
              </div>
              <div className="mt-5">
                <LifeBalanceHud categories={lifeCategories} />
              </div>
            </header>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Active Main Quests</h2>
                <Badge tone="muted">Campaign Goals</Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {mainQuests.length > 0 ? (
                  mainQuests.map((quest) => <QuestCard key={quest.id} quest={quest} />)
                ) : (
                  <EmptyQuestState label="No main quests yet." />
                )}
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Side Quests</h2>
                <Badge tone="muted">Quick Wins</Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {sideQuests.length > 0 ? (
                  sideQuests.map((quest) => <QuestCard key={quest.id} quest={quest} />)
                ) : (
                  <EmptyQuestState label="No side quests yet." />
                )}
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Recently Completed</h2>
                <Badge tone="muted">Victory Log</Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {completedQuests.length > 0 ? (
                  completedQuests.map((quest) => (
                    <QuestCard key={quest.id} quest={quest} />
                  ))
                ) : (
                  <EmptyQuestState label="No completed quests yet." />
                )}
              </div>
            </section>
          </section>

          <aside className="space-y-6">
            <RankPanel progress={progress} />
            <DashboardVerificationPanel items={verificationQueue} />
          </aside>
        </div>
      </main>

      <CreateQuestModal acceptedFriends={acceptedFriends} />
    </div>
  );
}

function EmptyQuestState({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card/45 p-6 text-sm text-muted-foreground">
      {label} Use the New Quest button to add one to your board.
    </div>
  );
}
