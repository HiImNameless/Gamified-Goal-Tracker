"use client";

import { type Dispatch, type SetStateAction, useState } from "react";
import { useFormStatus } from "react-dom";
import { Minus, Plus, X } from "lucide-react";
import { createQuestAction } from "@/app/quests/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CreateQuestModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [criteria, setCriteria] = useState([{ id: crypto.randomUUID(), type: "standalone" }]);
  const [rewards, setRewards] = useState([{ id: crypto.randomUUID() }]);
  const [stakes, setStakes] = useState([{ id: crypto.randomUUID() }]);
  const [visibility, setVisibility] = useState("friends");

  function closeModal() {
    setIsOpen(false);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const hasCriteria = formData
      .getAll("criteria_title")
      .some((title) => String(title).trim().length > 0);

    if (!hasCriteria) {
      event.preventDefault();
      event.currentTarget.reportValidity();
    }
  }

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

            <form
              className="grid max-h-[78vh] gap-4 overflow-y-auto p-5"
              action={createQuestAction}
              onSubmit={handleSubmit}
            >
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
                  <Input id="deadline" name="deadline" type="datetime-local" />
                </div>
              </div>

              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                  Success Criteria
                  </label>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setCriteria((items) => [
                        ...items,
                        { id: crypto.randomUUID(), type: "standalone" }
                      ])
                    }
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </Button>
                </div>
                {criteria.map((criterion, index) => (
                  <div
                    key={criterion.id}
                    className="grid gap-3 rounded-md border border-border bg-secondary/35 p-3 md:grid-cols-[minmax(0,1fr)_11rem_7rem_2.5rem]"
                  >
                    <Input
                      name="criteria_title"
                      placeholder="Clean out my closet"
                      required
                    />
                    <select
                      name="criteria_type"
                      value={criterion.type}
                      onChange={(event) =>
                        setCriteria((items) =>
                          items.map((item) =>
                            item.id === criterion.id
                              ? { ...item, type: event.target.value }
                              : item
                          )
                        )
                      }
                      className="h-10 rounded-md border border-input bg-secondary px-3 text-sm"
                    >
                      <option value="standalone">Objective</option>
                      <option value="count">Numbered</option>
                    </select>
                    <Input
                      name="criteria_target"
                      type="number"
                      min={1}
                      defaultValue={1}
                      disabled={criterion.type !== "count"}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setCriteria((items) =>
                          items.length > 1
                            ? items.filter((item) => item.id !== criterion.id)
                            : items
                        )
                      }
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <StructuredList
                  label="Rewards"
                  fieldName="reward_title"
                  placeholder="Order a nice coffee"
                  items={rewards}
                  setItems={setRewards}
                />
                <StructuredList
                  label="Stakes"
                  fieldName="stake_title"
                  placeholder="No gaming tonight"
                  items={stakes}
                  setItems={setStakes}
                />
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
                    value={visibility}
                    onChange={(event) => setVisibility(event.target.value)}
                    className="h-10 rounded-md border border-input bg-secondary px-3 text-sm"
                  >
                    <option value="friends">Friends</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>

              <div className="rounded-md border border-border bg-secondary/45 p-3 text-sm text-muted-foreground">
                {visibility === "friends"
                  ? "Proof is required for friend-visible quests."
                  : "Private quests skip proof for now."}
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeModal}
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

interface StructuredListProps {
  label: string;
  fieldName: string;
  placeholder: string;
  items: { id: string }[];
  setItems: Dispatch<SetStateAction<{ id: string }[]>>;
}

function StructuredList({
  label,
  fieldName,
  placeholder,
  items,
  setItems
}: StructuredListProps) {
  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setItems((current) => [...current, { id: crypto.randomUUID() }])}
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>
      {items.map((item) => (
        <div key={item.id} className="flex gap-2">
          <Input name={fieldName} placeholder={placeholder} />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() =>
              setItems((current) =>
                current.length > 1
                  ? current.filter((currentItem) => currentItem.id !== item.id)
                  : current
              )
            }
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
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
