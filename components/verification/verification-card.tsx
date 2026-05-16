"use client";

import { useState } from "react";
import { Check, ChevronDown, ExternalLink, FileText, Flame, ShieldCheck, X } from "lucide-react";
import { approveProofAction, rejectProofAction } from "@/app/verification/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getQuestProgress } from "@/lib/quest-utils";
import type { VerificationItem } from "@/lib/verification";

interface VerificationCardProps {
  item: VerificationItem;
}

export function VerificationCard({ item }: VerificationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [incompleteCriteriaIds, setIncompleteCriteriaIds] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const isImage =
    item.proof.fileUrl?.match(/\.(png|jpg|jpeg|webp|gif)$/i) &&
    item.attachmentSignedUrl;

  return (
    <Card className="bg-card/80">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <button
            type="button"
            className="flex min-w-0 items-center gap-3 text-left"
            onClick={() => setIsExpanded((current) => !current)}
          >
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md border border-border bg-secondary text-sm font-bold text-primary">
              {item.owner.displayName.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <div className="truncate text-base font-semibold">
                  {item.owner.displayName}
                </div>
                <div className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-amber-300">
                  <Flame className="h-3.5 w-3.5" />
                  {item.ownerStreak}
                </div>
              </div>
              <div className="mt-1 truncate text-xs text-muted-foreground">
                {item.quest.title}
              </div>
            </div>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-muted-foreground transition ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>

          <div className="flex items-center gap-2 md:justify-end">
            <Badge tone="warning">Pending</Badge>
            <form action={approveProofAction}>
              <input type="hidden" name="proof_id" value={item.proof.id} />
              <Button
                size="icon"
                type="submit"
                disabled={!isExpanded}
                aria-label="Approve proof"
              >
                <Check className="h-4 w-4" />
              </Button>
            </form>
            <Button
              size="icon"
              variant="outline"
              type="button"
              disabled={
                !isExpanded ||
                !comment.trim() ||
                incompleteCriteriaIds.length === 0
              }
              aria-label="Reject proof after entering a reason"
              onClick={() => {
                const form = document.getElementById(
                  `reject-${item.proof.id}`
                ) as HTMLFormElement | null;
                form?.requestSubmit();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isExpanded ? (
          <div className="mt-5 space-y-5 border-t border-border pt-5">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_16rem]">
              <div className="space-y-3">
                <p className="text-sm leading-6 text-muted-foreground">
                  {item.quest.description || "No description provided."}
                </p>
                <div className="rounded-md border border-border bg-secondary/40 p-3">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    Success Criteria
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {item.quest.criteria.map((criterion) => (
                      <label
                        key={criterion.id}
                        className="flex items-start gap-2 rounded-md border border-border bg-card/40 p-2"
                      >
                        <input
                          className="mt-1 h-4 w-4 accent-primary"
                          type="checkbox"
                          checked={!incompleteCriteriaIds.includes(criterion.id)}
                          onChange={(event) => {
                            setIncompleteCriteriaIds((current) =>
                              event.target.checked
                                ? current.filter((id) => id !== criterion.id)
                                : [...current, criterion.id]
                            );
                          }}
                        />
                        <span>{criterion.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3 rounded-md border border-border bg-secondary/40 p-3 text-sm">
                <div>
                  <div className="text-muted-foreground">Progress</div>
                  <div className="font-semibold">{getQuestProgress(item.quest)}%</div>
                </div>
                <div>
                  <div className="text-muted-foreground">LP Reward</div>
                  <div className="font-semibold text-primary">
                    +{item.quest.lpReward} LP
                  </div>
                </div>
                {item.proof.fileUrl ? (
                  <div>
                    <div className="text-muted-foreground">Attachment</div>
                    {item.attachmentSignedUrl ? (
                      <a
                        className="mt-1 inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
                        href={item.attachmentSignedUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <FileText className="h-4 w-4" />
                        Open proof
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <div className="mt-1 break-all text-xs text-muted-foreground">
                        {item.proof.fileUrl}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>

            {isImage ? (
              <div className="overflow-hidden rounded-md border border-border bg-secondary/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.attachmentSignedUrl}
                  alt="Submitted proof"
                  className="max-h-96 w-full object-contain"
                />
              </div>
            ) : null}

            <div className="rounded-md border border-border bg-card/70 p-4">
              <div className="mb-2 text-sm font-semibold">Proof Note</div>
              <p className="text-sm leading-6 text-muted-foreground">
                {item.proof.proofText || "No proof note provided."}
              </p>
            </div>

            <form id={`reject-${item.proof.id}`} className="space-y-3" action={rejectProofAction}>
              <input type="hidden" name="proof_id" value={item.proof.id} />
              {incompleteCriteriaIds.map((criteriaId) => (
                <input
                  key={criteriaId}
                  type="hidden"
                  name="incomplete_criteria_id"
                  value={criteriaId}
                />
              ))}
              <Textarea
                name="reviewer_comment"
                placeholder="Comments (Required for rejection)"
                required
                value={comment}
                onChange={(event) => setComment(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Rejection requires a comment and at least one unchecked criterion.
              </p>
            </form>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
