import { Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getRankName, getRankProgress, LP_PER_RANK } from "@/lib/ranks";
import type { UserProgress } from "@/lib/types";

interface RankPanelProps {
  progress: UserProgress;
}

export function RankPanel({ progress }: RankPanelProps) {
  return (
    <Card className="border-primary/20 bg-card/80 shadow-glow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Crown className="h-4 w-4 text-accent" />
          Rank / LP
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold">{getRankName(progress.rankTier)}</div>
            <div className="text-xs text-muted-foreground">
              Tier {progress.rankTier + 1}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-semibold text-primary">{progress.lp}</div>
            <div className="text-xs text-muted-foreground">/ {LP_PER_RANK} LP</div>
          </div>
        </div>
        <Progress value={getRankProgress(progress.lp)} className="mt-4 h-3" />
      </CardContent>
    </Card>
  );
}
