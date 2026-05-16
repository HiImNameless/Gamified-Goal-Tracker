import Link from "next/link";
import { Flame, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { VerificationItem } from "@/lib/verification";

interface DashboardVerificationPanelProps {
  items: VerificationItem[];
}

export function DashboardVerificationPanel({
  items
}: DashboardVerificationPanelProps) {
  const visibleItems = items.slice(0, 4);

  return (
    <Card className="bg-card/80">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between gap-3 text-sm">
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Pending Verification
          </span>
          <Badge tone={items.length > 0 ? "warning" : "muted"}>
            {items.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {visibleItems.length > 0 ? (
          visibleItems.map((item) => (
            <Link
              key={item.proof.id}
              href="/verification"
              className="block rounded-md border border-border bg-secondary/40 p-3 transition hover:border-primary/50 hover:bg-secondary/60"
            >
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-border bg-card text-xs font-bold text-primary">
                  {item.owner.displayName.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-sm font-semibold">
                      {item.owner.displayName}
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300">
                      <Flame className="h-3 w-3" />
                      {item.ownerStreak}
                    </span>
                  </div>
                  <div className="mt-1 truncate text-xs text-muted-foreground">
                    {item.quest.title}
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="rounded-md border border-dashed border-border bg-card/45 p-4 text-sm text-muted-foreground">
            No proof is waiting for your review.
          </div>
        )}

        <Link
          href="/verification"
          className="inline-flex h-10 w-full items-center justify-center rounded-md border border-border bg-transparent px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-secondary"
        >
          Open Verification Queue
        </Link>
      </CardContent>
    </Card>
  );
}
