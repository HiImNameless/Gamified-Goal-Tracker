import type { QuestDifficulty, RankName } from "@/lib/types";

export const RANK_TIERS = [
  "Iron",
  "Bronze",
  "Silver",
  "Gold",
  "Platinum",
  "Emerald",
  "Diamond",
  "Master",
  "Grandmaster",
  "Challenger"
] as const;

export const DIVISIONS = ["IV", "III", "II", "I"] as const;

export const RANKS: RankName[] = [
  "Iron IV",
  "Iron III",
  "Iron II",
  "Iron I",
  "Bronze IV",
  "Bronze III",
  "Bronze II",
  "Bronze I",
  "Silver IV",
  "Silver III",
  "Silver II",
  "Silver I",
  "Gold IV",
  "Gold III",
  "Gold II",
  "Gold I",
  "Platinum IV",
  "Platinum III",
  "Platinum II",
  "Platinum I",
  "Emerald IV",
  "Emerald III",
  "Emerald II",
  "Emerald I",
  "Diamond IV",
  "Diamond III",
  "Diamond II",
  "Diamond I",
  "Master",
  "Grandmaster",
  "Challenger"
];

export const LP_PER_RANK = 100;

export const LP_BY_DIFFICULTY: Record<
  QuestDifficulty,
  { reward: number; penalty: number; xp: number }
> = {
  easy: { reward: 4, penalty: -8, xp: 20 },
  medium: { reward: 8, penalty: -16, xp: 45 },
  hard: { reward: 15, penalty: -30, xp: 85 },
  boss: { reward: 25, penalty: -50, xp: 180 }
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
