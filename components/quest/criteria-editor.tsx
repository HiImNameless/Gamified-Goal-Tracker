"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, Circle, Minus, Plus } from "lucide-react";
import { updateCriteriaAction } from "@/app/quests/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { QuestCriteria } from "@/lib/types";

interface CriteriaEditorProps {
  questId: string;
  criteria: QuestCriteria[];
  canEdit: boolean;
}

export function CriteriaEditor({ questId, criteria, canEdit }: CriteriaEditorProps) {
  const initialState = useMemo(
    () =>
      criteria.map((criterion) => ({
        id: criterion.id,
        count: criterion.isCompleted
          ? criterion.targetCount
          : criterion.currentCount
      })),
    [criteria]
  );
  const [values, setValues] = useState(initialState);

  function getCount(id: string) {
    return values.find((value) => value.id === id)?.count ?? 0;
  }

  function setCount(id: string, nextCount: number, max: number) {
    setValues((current) =>
      current.map((value) =>
        value.id === id
          ? { ...value, count: Math.min(max, Math.max(0, nextCount)) }
          : value
      )
    );
  }

  return (
    <form action={updateCriteriaAction} className="space-y-3">
      <input type="hidden" name="quest_id" value={questId} />
      {criteria.map((criterion) => {
        const currentCount = getCount(criterion.id);
        const isComplete = currentCount >= criterion.targetCount;

        return (
          <div
            key={criterion.id}
            className="flex flex-col gap-3 rounded-md border border-border bg-secondary/40 p-4 sm:flex-row sm:items-start sm:justify-between"
          >
            <input type="hidden" name="criteria_id" value={criterion.id} />
            <input
              type="hidden"
              name="criteria_current_count"
              value={currentCount}
            />

            <div className="flex min-w-0 gap-3">
              <button
                type="button"
                disabled={!canEdit}
                onClick={() =>
                  setCount(
                    criterion.id,
                    criterion.type === "count" ? criterion.targetCount : isComplete ? 0 : 1,
                    criterion.targetCount
                  )
                }
                className="mt-0.5 h-5 w-5 shrink-0 text-left disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={
                  isComplete
                    ? "Mark criterion incomplete"
                    : "Mark criterion complete"
                }
              >
                {isComplete ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </button>

              <div className="min-w-0">
                <div className="font-medium">{criterion.title}</div>
                {criterion.type === "count" ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {currentCount}/{criterion.targetCount} completed
                  </p>
                ) : null}
                {criterion.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {criterion.description}
                  </p>
                ) : null}
              </div>
            </div>

            {criterion.type === "count" ? (
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={!canEdit || currentCount <= 0}
                  onClick={() =>
                    setCount(criterion.id, currentCount - 1, criterion.targetCount)
                  }
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  className="h-10 w-20 text-center"
                  type="number"
                  min={0}
                  max={criterion.targetCount}
                  value={currentCount}
                  disabled={!canEdit}
                  onChange={(event) =>
                    setCount(
                      criterion.id,
                      Number(event.target.value) || 0,
                      criterion.targetCount
                    )
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={!canEdit || currentCount >= criterion.targetCount}
                  onClick={() =>
                    setCount(criterion.id, currentCount + 1, criterion.targetCount)
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ) : null}
          </div>
        );
      })}

      {canEdit ? (
        <div className="flex justify-end">
          <SubmitCriteriaButton />
        </div>
      ) : null}
    </form>
  );
}

function SubmitCriteriaButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Submit"}
    </Button>
  );
}
