import { createClient } from "@/lib/supabase/server";
import { ensureLifeCategoryProgress } from "@/lib/life-category-progress";
import type { SkillCategory } from "@/lib/types";

export const STARTER_SKILLS: SkillCategory[] = [
  "health",
  "fitness",
  "programming",
  "editing",
  "study",
  "money",
  "creativity",
  "discipline"
];

export async function ensureProgressAndSkills(userId: string) {
  const supabase = createClient();

  await supabase.from("user_progress").upsert(
    {
      user_id: userId
    },
    {
      onConflict: "user_id",
      ignoreDuplicates: true
    }
  );

  await supabase.from("skill_progress").upsert(
    STARTER_SKILLS.map((skillCategory) => ({
      user_id: userId,
      skill_category: skillCategory
    })),
    {
      onConflict: "user_id,skill_category",
      ignoreDuplicates: true
    }
  );

  await ensureLifeCategoryProgress(userId);
}
