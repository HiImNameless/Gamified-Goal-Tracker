import {
  LIFE_CATEGORIES,
  LIFE_CATEGORY_COMPLETION_POINTS,
  LIFE_CATEGORY_FAILURE_POINTS,
  clampLifeCategoryPoints,
  getLifeCategoryDecayAmount
} from "@/lib/life-categories";
import { createClient } from "@/lib/supabase/server";
import type { LifeCategory, LifeCategoryProgress, QuestDifficulty } from "@/lib/types";

type LifeCategoryProgressRow = {
  id: string;
  user_id: string;
  category: LifeCategory;
  points: number;
  last_completed_at: string | null;
  last_decay_applied_at: string;
  created_at: string;
  updated_at: string;
};

export function mapLifeCategoryProgress(row: LifeCategoryProgressRow): LifeCategoryProgress {
  return {
    id: row.id,
    userId: row.user_id,
    category: row.category,
    points: row.points,
    lastCompletedAt: row.last_completed_at ?? undefined,
    lastDecayAppliedAt: row.last_decay_applied_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function ensureLifeCategoryProgress(userId: string) {
  const supabase = createClient();

  const { error } = await supabase.from("life_category_progress").upsert(
    LIFE_CATEGORIES.map((category) => ({
      user_id: userId,
      category
    })),
    {
      onConflict: "user_id,category",
      ignoreDuplicates: true
    }
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function applyLifeCategoryDecay(userId: string) {
  const supabase = createClient();
  await ensureLifeCategoryProgress(userId);

  const { data, error } = await supabase
    .from("life_category_progress")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  const now = new Date();
  const nowIso = now.toISOString();

  await Promise.all(
    (data ?? []).map(async (row) => {
      const decayAmount = getLifeCategoryDecayAmount({
        lastCompletedAt: row.last_completed_at ?? undefined,
        lastDecayAppliedAt: row.last_decay_applied_at,
        createdAt: row.created_at,
        now
      });

      if (decayAmount <= 0) {
        return;
      }

      const { error: updateError } = await supabase
        .from("life_category_progress")
        .update({
          points: clampLifeCategoryPoints(row.points - decayAmount),
          last_decay_applied_at: nowIso
        })
        .eq("id", row.id)
        .eq("user_id", userId);

      if (updateError) {
        throw new Error(updateError.message);
      }
    })
  );
}

export async function awardLifeCategoryPoints({
  userId,
  category,
  difficulty,
  completedAt
}: {
  userId: string;
  category: LifeCategory;
  difficulty: QuestDifficulty;
  completedAt: string;
}) {
  const supabase = createClient();
  await ensureLifeCategoryProgress(userId);

  const { data: progress, error: progressError } = await supabase
    .from("life_category_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("category", category)
    .maybeSingle();

  if (progressError) {
    throw new Error(progressError.message);
  }

  if (!progress) {
    throw new Error("Life category progress was not initialized.");
  }

  const { error: updateError } = await supabase
    .from("life_category_progress")
    .update({
      points: clampLifeCategoryPoints(
        progress.points + LIFE_CATEGORY_COMPLETION_POINTS[difficulty]
      ),
      last_completed_at: completedAt,
      last_decay_applied_at: completedAt
    })
    .eq("id", progress.id)
    .eq("user_id", userId);

  if (updateError) {
    throw new Error(updateError.message);
  }
}

export async function penalizeLifeCategoryPoints({
  userId,
  category,
  difficulty
}: {
  userId: string;
  category: LifeCategory;
  difficulty: QuestDifficulty;
}) {
  const supabase = createClient();
  await ensureLifeCategoryProgress(userId);

  const { data: progress, error: progressError } = await supabase
    .from("life_category_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("category", category)
    .maybeSingle();

  if (progressError) {
    throw new Error(progressError.message);
  }

  if (!progress) {
    throw new Error("Life category progress was not initialized.");
  }

  const { error: updateError } = await supabase
    .from("life_category_progress")
    .update({
      points: clampLifeCategoryPoints(
        progress.points + LIFE_CATEGORY_FAILURE_POINTS[difficulty]
      )
    })
    .eq("id", progress.id)
    .eq("user_id", userId);

  if (updateError) {
    throw new Error(updateError.message);
  }
}
