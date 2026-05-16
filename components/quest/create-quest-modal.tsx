"use client";

import { type Dispatch, type ReactNode, type SetStateAction, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  Asterisk,
  CalendarClock,
  Eye,
  Gift,
  ListChecks,
  Minus,
  Plus,
  ScrollText,
  Settings2,
  ShieldCheck,
  Sparkles,
  X
} from "lucide-react";
import { createQuestAction } from "@/app/quests/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Profile } from "@/lib/types";

interface CreateQuestModalProps {
  acceptedFriends: Profile[];
}

export function CreateQuestModal({ acceptedFriends }: CreateQuestModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [criteria, setCriteria] = useState([
    { id: crypto.randomUUID(), type: "standalone" }
  ]);
  const [rewards, setRewards] = useState([{ id: crypto.randomUUID() }]);
  const [stakes, setStakes] = useState([{ id: crypto.randomUUID() }]);
  const [visibility, setVisibility] = useState("friends");

  function resetModalState() {
    setCriteria([{ id: crypto.randomUUID(), type: "standalone" }]);
    setRewards([{ id: crypto.randomUUID() }]);
    setStakes([{ id: crypto.randomUUID() }]);
    setVisibility("friends");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const hasCriteria = formData
      .getAll("criteria_title")
      .some((title) => String(title).trim().length > 0);

    if (!hasCriteria) {
      event.preventDefault();
      event.currentTarget.reportValidity();
      return;
    }

    if (visibility === "friends" && acceptedFriends.length === 0) {
      event.preventDefault();
      event.currentTarget.reportValidity();
      return;
    }

    setIsOpen(false);
    resetModalState();
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
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  Create Quest
                </h2>
                <p className="text-sm text-muted-foreground">
                  Build the quest contract before it hits your board.
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form
              className="grid max-h-[78vh] gap-5 overflow-y-auto p-5"
              action={createQuestAction}
              onSubmit={handleSubmit}
            >
              <FormSection
                icon={<ScrollText className="h-4 w-4 text-primary" />}
                title="Quest Brief"
              >
                <div className="grid gap-2">
                  <FieldLabel htmlFor="title" required>
                    Title
                  </FieldLabel>
                  <Input id="title" name="title" placeholder="Train for 5K run" required />
                </div>

                <div className="grid gap-2">
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="What does this quest ask of you?"
                  />
                </div>
              </FormSection>

              <FormSection
                icon={<Settings2 className="h-4 w-4 text-primary" />}
                title="Quest Settings"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <FieldLabel htmlFor="type" required>
                      Type
                    </FieldLabel>
                    <select
                      id="type"
                      name="type"
                      className="h-10 rounded-md border border-input bg-secondary px-3 text-sm"
                    >
                      <option value="main">Main Quest</option>
                      <option value="side">Side Quest</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <FieldLabel htmlFor="difficulty" required>
                      Difficulty
                    </FieldLabel>
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
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <FieldLabel htmlFor="life-category" required>
                      Category
                    </FieldLabel>
                    <select
                      id="life-category"
                      name="life_category"
                      className="h-10 rounded-md border border-input bg-secondary px-3 text-sm"
                    >
                      <option value="health">Health</option>
                      <option value="wealth">Wealth</option>
                      <option value="social">Social</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <FieldLabel htmlFor="deadline">
                      <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
                      Deadline
                    </FieldLabel>
                    <Input id="deadline" name="deadline" type="datetime-local" />
                  </div>
                </div>
              </FormSection>

              <FormSection
                icon={<ListChecks className="h-4 w-4 text-primary" />}
                title="Success Criteria"
              >
                <div className="flex items-center justify-between">
                  <FieldLabel required>Criteria</FieldLabel>
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
                {criteria.map((criterion) => (
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
              </FormSection>

              <FormSection
                icon={<Gift className="h-4 w-4 text-amber-300" />}
                title="Rewards & Stakes"
              >
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
              </FormSection>

              <FormSection
                icon={<ShieldCheck className="h-4 w-4 text-primary" />}
                title="Rules & Visibility"
              >
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_12rem]">
                  <div className="grid gap-2">
                    <FieldLabel htmlFor="failure-condition">
                      Failure Condition
                    </FieldLabel>
                    <Input
                      id="failure-condition"
                      name="failure_condition"
                      placeholder="What counts as failing?"
                    />
                  </div>
                  <div className="grid gap-2">
                    <FieldLabel htmlFor="visibility" required>
                      <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                      Visibility
                    </FieldLabel>
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

                {visibility === "friends" ? (
                  <div className="grid gap-2">
                    <FieldLabel htmlFor="verifier" required>
                      Verifier
                    </FieldLabel>
                    <select
                      id="verifier"
                      name="verifier_id"
                      required
                      className="h-10 rounded-md border border-input bg-secondary px-3 text-sm"
                    >
                      <option value="">
                        {acceptedFriends.length > 0
                          ? "Choose a friend"
                          : "Add a friend first"}
                      </option>
                      {acceptedFriends.map((friend) => (
                        <option key={friend.id} value={friend.id}>
                          {friend.displayName}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}

                <div className="rounded-md border border-border bg-secondary/45 p-3 text-sm text-muted-foreground">
                  {visibility === "friends"
                    ? "Proof is required for friend-visible quests."
                    : "Private quests skip proof for now."}
                </div>
              </FormSection>

              <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
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

function FieldLabel({
  children,
  htmlFor,
  required = false
}: {
  children: ReactNode;
  htmlFor?: string;
  required?: boolean;
}) {
  return (
    <label
      className="inline-flex items-center gap-1 text-sm font-medium"
      htmlFor={htmlFor}
    >
      {children}
      {required ? <RequiredMark /> : null}
    </label>
  );
}

function RequiredMark() {
  return <Asterisk className="h-3.5 w-3.5 stroke-[3] text-amber-300" />;
}

function FormSection({
  icon,
  title,
  children
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4 border-t border-border pt-5 first:border-t-0 first:pt-0">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <span className="grid h-7 w-7 place-items-center rounded-md border border-border bg-secondary/60">
          {icon}
        </span>
        {title}
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
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
