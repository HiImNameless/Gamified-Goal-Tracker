import type { QuestDifficulty, RankName } from "@/lib/types";

export const RANKS: RankName[] = [
  "Novice",
  "Apprentice",
  "Adept",
  "Veteran",
  "Elite",
  "Champion",
  "Mythic",
  "Ascendant"
];

export const LP_PER_RANK = 100;

export const LP_BY_DIFFICULTY: Record<
  QuestDifficulty,
  { reward: number; penalty: number; xp: number }
> = {
  easy: { reward: 5, penalty: -2, xp: 20 },
  medium: { reward: 10, penalty: -5, xp: 45 },
  hard: { reward: 20, penalty: -10, xp: 85 },
  boss: { reward: 40, penalty: -20, xp: 180 }
};

export function getRankName(rankTier: number): RankName {
  return RANKS[Math.max(0, Math.min(rankTier, RANKS.length - 1))];
}

export function getRankProgress(lp: number) {
  return Math.max(0, Math.min(100, (lp / LP_PER_RANK) * 100));
}

export function applyLpChange(rankTier: number, lp: number, amount: number) {
  let nextRankTier = rankTier;
  let nextLp = lp + amount;

  while (nextLp >= LP_PER_RANK && nextRankTier < RANKS.length - 1) {
    nextRankTier += 1;
    nextLp -= LP_PER_RANK;
  }

  while (nextLp < 0 && nextRankTier > 0) {
    nextRankTier -= 1;
    nextLp += LP_PER_RANK;
  }

  if (nextRankTier === 0 && nextLp < 0) {
    nextLp = 0;
  }

  if (nextRankTier === RANKS.length - 1 && nextLp > LP_PER_RANK) {
    nextLp = LP_PER_RANK;
  }

  return {
    rankTier: nextRankTier,
    rankName: getRankName(nextRankTier),
    lp: nextLp,
    progressPercent: getRankProgress(nextLp)
  };
}
