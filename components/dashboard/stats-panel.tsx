import { Flame, Medal, Skull, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserProgress } from "@/lib/types";

interface StatsPanelProps {
  progress: UserProgress;
}

export function StatsPanel({ progress }: StatsPanelProps) {
  const stats = [
    { label: "Completed", value: progress.completedQuests, icon: Medal },
    { label: "Failed", value: progress.failedQuests, icon: Skull },
    { label: "Streak", value: `${progress.currentStreak}d`, icon: Flame },
    { label: "Total XP", value: progress.totalXp, icon: Sparkles }
  ];

  return (
    <Card className="bg-card/80">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Stats</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-md border border-border bg-secondary/50 p-3">
            <stat.icon className="mb-2 h-4 w-4 text-primary" />
            <div className="text-lg font-semibold">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
