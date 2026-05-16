"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Flag, Target, XCircle } from "lucide-react";
import {
  forfeitQuestAction,
  toggleTrackedQuestAction
} from "@/app/quests/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuestActionButtonsProps {
  questId: string;
  isTracked: boolean;
  canTrack?: boolean;
  canForfeit: boolean;
  compact?: boolean;
}

export function QuestActionButtons({
  questId,
  isTracked,
  canTrack = true,
  canForfeit,
  compact = false
}: QuestActionButtonsProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  return (
    <>
      <div className={cn("flex items-center gap-2", compact && "gap-1.5")}>
        {canTrack ? (
          <form action={toggleTrackedQuestAction}>
            <input type="hidden" name="quest_id" value={questId} />
            <input
              type="hidden"
              name="should_track"
              value={isTracked ? "false" : "true"}
            />
            <Button
              size={compact ? "icon" : "sm"}
              variant={isTracked ? "accent" : "outline"}
              type="submit"
              title={isTracked ? "Untrack quest" : "Track quest"}
            >
              {isTracked ? <Target className="h-4 w-4" /> : <Flag className="h-4 w-4" />}
              {compact ? null : isTracked ? "Tracked" : "Track"}
            </Button>
          </form>
        ) : null}

        {canForfeit ? (
          <Button
            size={compact ? "icon" : "sm"}
            variant="outline"
            type="button"
            onClick={() => setIsConfirming(true)}
            title="Forfeit quest"
          >
            <XCircle className="h-4 w-4 text-red-300" />
            {compact ? null : "Forfeit"}
          </Button>
        ) : null}
      </div>

      {isConfirming && typeof document !== "undefined" ? createPortal(
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg border border-border bg-card p-5 shadow-2xl">
            <h2 className="text-lg font-semibold">Forfeit quest?</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              This will mark the quest as forfeited and apply its LP and life category
              losses. This cannot be undone from the current UI.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsConfirming(false)}
              >
                Cancel
              </Button>
              <form action={forfeitQuestAction}>
                <input type="hidden" name="quest_id" value={questId} />
                <Button type="submit" variant="outline">
                  Confirm Forfeit
                </Button>
              </form>
            </div>
          </div>
        </div>,
        document.body
      ) : null}
    </>
  );
}
