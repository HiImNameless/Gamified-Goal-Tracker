"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Plus, X } from "lucide-react";
import { createQuestAction } from "@/app/quests/actions";
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
                  Add a real quest to your Supabase-backed board.
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form className="grid max-h-[78vh] gap-4 overflow-y-auto p-5" action={createQuestAction}>
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="title">
                  Title
                </label>
                <Input id="title" name="title" placeholder="Train for 5K run" required />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="description">
                  Description
                </label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="What does this quest ask of you?"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="type">
                    Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    className="h-10 rounded-md border border-input bg-secondary px-3 text-sm"
                  >
                    <option value="main">Main Quest</option>
                    <option value="side">Side Quest</option>
                    <option value="boss">Boss Quest</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="difficulty">
                    Difficulty
                  </label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    className="h-10 rounded-md border border-input bg-secondary px-3 text-sm"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="boss">Boss</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="skill-category">
                    Skill
                  </label>
                  <select
                    id="skill-category"
                    name="skill_category"
                    className="h-10 rounded-md border border-input bg-secondary px-3 text-sm"
                  >
                    <option value="discipline">Discipline</option>
                    <option value="health">Health</option>
                    <option value="fitness">Fitness</option>
                    <option value="programming">Programming</option>
                    <option value="editing">Editing</option>
                    <option value="study">Study</option>
                    <option value="money">Money</option>
                    <option value="creativity">Creativity</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="deadline">
                    Deadline
                  </label>
                  <Input id="deadline" name="deadline" type="date" />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="criteria">
                  Success Criteria
                </label>
                <Textarea
                  id="criteria"
                  name="criteria"
                  placeholder="One criterion per line for now"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="reward">
                    Reward
                  </label>
                  <Input id="reward" name="reward_text" placeholder="What do you earn?" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="stake">
                    Stake
                  </label>
                  <Input id="stake" name="stake_text" placeholder="What is at risk?" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_12rem]">
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="failure-condition">
                    Failure Condition
                  </label>
                  <Input
                    id="failure-condition"
                    name="failure_condition"
                    placeholder="What counts as failing?"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="visibility">
                    Visibility
                  </label>
                  <select
                    id="visibility"
                    name="visibility"
                    className="h-10 rounded-md border border-input bg-secondary px-3 text-sm"
                  >
                    <option value="private">Private</option>
                    <option value="friends">Friends</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-3 rounded-md border border-border bg-secondary/45 p-3 text-sm">
                <input
                  name="proof_required"
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                />
                Proof required before completion
              </label>

              <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <SubmitQuestButton />
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

function SubmitQuestButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating..." : "Create Quest"}
    </Button>
  );
}
