import { applyLpChange } from "@/lib/ranks";
import { createClient } from "@/lib/supabase/server";

export async function completeQuestForUser(userId: string, questId: string) {
  const supabase = createClient();
  const { data: quest } = await supabase
    .from("quests")
    .select("id, owner_id, status, skill_category, xp_reward, lp_reward")
    .eq("id", questId)
    .eq("owner_id", userId)
    .maybeSingle();

  if (!quest || quest.status === "completed") {
    return;
  }

  const { data: progress } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!progress) {
    return;
  }

  const nextRank = applyLpChange(progress.rank_tier, progress.lp, quest.lp_reward);
  const completedAt = new Date().toISOString();

  await supabase
    .from("quests")
    .update({
      status: "completed",
      completed_at: completedAt
    })
    .eq("id", questId)
    .eq("owner_id", userId);

  await supabase
    .from("user_progress")
    .update({
      rank_tier: nextRank.rankTier,
      lp: nextRank.lp,
      total_xp: progress.total_xp + quest.xp_reward,
      completed_quests: progress.completed_quests + 1
    })
    .eq("user_id", userId);

  await supabase.from("lp_events").insert({
    user_id: userId,
    quest_id: questId,
    amount: quest.lp_reward,
    previous_rank_tier: progress.rank_tier,
    previous_lp: progress.lp,
    new_rank_tier: nextRank.rankTier,
    new_lp: nextRank.lp,
    reason: "Quest completed"
  });

  const { data: skill } = await supabase
    .from("skill_progress")
    .select("id, xp")
    .eq("user_id", userId)
    .eq("skill_category", quest.skill_category)
    .maybeSingle();

  if (skill) {
    await supabase
      .from("skill_progress")
      .update({
        xp: skill.xp + quest.xp_reward
      })
      .eq("id", skill.id);
  }

  await supabase.from("quest_logs").insert({
    quest_id: questId,
    user_id: userId,
    action: "completed",
    note: `Quest completed. Awarded ${quest.lp_reward} LP.`
  });
}
