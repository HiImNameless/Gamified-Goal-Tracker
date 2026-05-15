import { CreateQuestModal } from "@/components/quest/create-quest-modal";
import { QuestCard } from "@/components/quest/quest-card";
import { RankPanel } from "@/components/dashboard/rank-panel";
import { Sidebar } from "@/components/dashboard/sidebar";
import { SkillsPanel } from "@/components/dashboard/skills-panel";
import { StatsPanel } from "@/components/dashboard/stats-panel";
import { Badge } from "@/components/ui/badge";
import { mockProgress, mockQuests, mockSkills } from "@/lib/mock-data";

export function DashboardShell() {
  const mainQuests = mockQuests.filter((quest) => quest.type === "main");
  const sideQuests = mockQuests.filter((quest) => quest.type === "side");

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="w-full px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
          <section className="min-w-0 space-y-6">
            <header className="flex flex-col gap-4 rounded-lg border border-border bg-card/70 p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Badge tone="default">Quest Board</Badge>
                <h1 className="mt-3 text-3xl font-bold">Today&apos;s Campaign</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Track real-life quests, push proof to a verifier, and keep your LP economy honest.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-md border border-border bg-secondary/60 p-3">
                  <div className="text-lg font-bold text-primary">{mainQuests.length}</div>
                  <div className="text-muted-foreground">Main</div>
                </div>
                <div className="rounded-md border border-border bg-secondary/60 p-3">
                  <div className="text-lg font-bold text-primary">{sideQuests.length}</div>
                  <div className="text-muted-foreground">Side</div>
                </div>
                <div className="rounded-md border border-border bg-secondary/60 p-3">
                  <div className="text-lg font-bold text-primary">
                    {mockQuests.filter((quest) => quest.status === "pending_verification").length}
                  </div>
                  <div className="text-muted-foreground">Review</div>
                </div>
              </div>
            </header>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Active Main Quests</h2>
                <Badge tone="muted">Campaign Goals</Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {mainQuests.map((quest) => (
                  <QuestCard key={quest.id} quest={quest} />
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Side Quests</h2>
                <Badge tone="muted">Quick Wins</Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {sideQuests.map((quest) => (
                  <QuestCard key={quest.id} quest={quest} />
                ))}
              </div>
            </section>
          </section>

          <aside className="space-y-6">
            <RankPanel progress={mockProgress} />
            <StatsPanel progress={mockProgress} />
            <SkillsPanel skills={mockSkills} />
          </aside>
        </div>
      </main>

      <CreateQuestModal />
    </div>
  );
}
