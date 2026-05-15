"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CreateQuestModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        className="fixed bottom-6 right-6 z-20 h-14 rounded-full px-5 shadow-glow"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="h-5 w-5" />
        New Quest
      </Button>

      {isOpen ? (
        <div className="fixed inset-0 z-30 grid place-items-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-lg border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border p-5">
              <div>
                <h2 className="text-lg font-semibold">Create Quest</h2>
                <p className="text-sm text-muted-foreground">
                  Mock form for the first local prototype.
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form className="grid gap-4 p-5">
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="title">
                  Title
                </label>
                <Input id="title" placeholder="Train for 5K run" />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="description">
                  Description
                </label>
                <Textarea
                  id="description"
                  placeholder="What does this quest ask of you?"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="type">
                    Type
                  </label>
                  <select
                    id="type"
                    className="h-10 rounded-md border border-input bg-secondary px-3 text-sm"
                  >
                    <option>Main Quest</option>
                    <option>Side Quest</option>
                    <option>Boss Quest</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="difficulty">
                    Difficulty
                  </label>
                  <select
                    id="difficulty"
                    className="h-10 rounded-md border border-input bg-secondary px-3 text-sm"
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                    <option>Boss</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="deadline">
                    Deadline
                  </label>
                  <Input id="deadline" type="date" />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="criteria">
                  Success Criteria
                </label>
                <Textarea
                  id="criteria"
                  placeholder="One criterion per line for now"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="reward">
                    Reward
                  </label>
                  <Input id="reward" placeholder="What do you earn?" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="stake">
                    Stake
                  </label>
                  <Input id="stake" placeholder="What is at risk?" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="button" onClick={() => setIsOpen(false)}>
                  Save Draft
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
