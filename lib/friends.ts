import { createClient } from "@/lib/supabase/server";
import {
  mapCriteria,
  mapProfile,
  mapQuest,
  mapStructuredItem,
  mapUserProgress
} from "@/lib/supabase/mappers";
import type {
  FriendshipStatus,
  Profile,
  Quest,
  QuestCriteria,
  QuestStructuredItem,
  UserProgress
} from "@/lib/types";

export interface FriendConnection {
  friendshipId: string;
  status: FriendshipStatus;
  direction: "incoming" | "outgoing" | "accepted";
  profile: Profile;
  progress?: Pick<UserProgress, "rankTier" | "lp" | "currentStreak">;
  activeQuestCounts?: {
    main: number;
    side: number;
    boss: number;
  };
  createdAt: string;
}

export async function getFriendsData(userId: string) {
  const supabase = createClient();

  const { data: friendships } = await supabase
    .from("friendships")
    .select("*")
    .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  const rows = friendships ?? [];
  const profileIds = Array.from(
    new Set(
      rows.map((friendship) =>
        friendship.requester_id === userId
          ? friendship.receiver_id
          : friendship.requester_id
      )
    )
  );

  const { data: profiles } =
    profileIds.length > 0
      ? await supabase.from("profiles").select("*").in("id", profileIds)
      : { data: [] };

  const profileById = new Map(
    (profiles ?? []).map((profile) => [profile.id, mapProfile(profile)])
  );

  const [progressResult, questsResult] =
    profileIds.length > 0
      ? await Promise.all([
          supabase
            .from("user_progress")
            .select("user_id, rank_tier, lp, current_streak")
            .in("user_id", profileIds),
          supabase
            .from("quests")
            .select("owner_id, type")
            .in("owner_id", profileIds)
            .in("status", ["active", "pending_verification"])
        ])
      : [{ data: [] }, { data: [] }];

  const progressByUserId = new Map(
    (progressResult.data ?? []).map((progress) => [
      progress.user_id,
      {
        rankTier: progress.rank_tier,
        lp: progress.lp,
        currentStreak: progress.current_streak
      }
    ])
  );

  const questCountsByUserId = new Map<
    string,
    { main: number; side: number; boss: number }
  >();

  (questsResult.data ?? []).forEach((quest) => {
    const counts =
      questCountsByUserId.get(quest.owner_id) ?? { main: 0, side: 0, boss: 0 };
    counts[quest.type] += 1;
    questCountsByUserId.set(quest.owner_id, counts);
  });

  const connections = rows.reduce<FriendConnection[]>((result, friendship) => {
      const otherId =
        friendship.requester_id === userId
          ? friendship.receiver_id
          : friendship.requester_id;
      const profile = profileById.get(otherId);

      if (!profile) {
        return result;
      }

      const direction: FriendConnection["direction"] =
        friendship.status === "accepted"
          ? "accepted"
          : friendship.receiver_id === userId
            ? "incoming"
            : "outgoing";

      result.push({
        friendshipId: friendship.id,
        status: friendship.status,
        direction,
        profile,
        progress: progressByUserId.get(otherId),
        activeQuestCounts:
          questCountsByUserId.get(otherId) ?? { main: 0, side: 0, boss: 0 },
        createdAt: friendship.created_at
      });

      return result;
    }, []);

  return {
    accepted: connections.filter((connection) => connection.status === "accepted"),
    incoming: connections.filter(
      (connection) =>
        connection.status === "pending" && connection.direction === "incoming"
    ),
    outgoing: connections.filter(
      (connection) =>
        connection.status === "pending" && connection.direction === "outgoing"
    ),
    rejected: connections.filter((connection) => connection.status === "rejected")
  };
}

export async function getFriendProfileData(userId: string, friendId: string) {
  const supabase = createClient();

  const { data: friendship } = await supabase
    .from("friendships")
    .select("id")
    .eq("status", "accepted")
    .or(
      `and(requester_id.eq.${userId},receiver_id.eq.${friendId}),and(requester_id.eq.${friendId},receiver_id.eq.${userId})`
    )
    .maybeSingle();

  if (!friendship) {
    return null;
  }

  const [profileResult, progressResult, questsResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", friendId).maybeSingle(),
    supabase.from("user_progress").select("*").eq("user_id", friendId).maybeSingle(),
    supabase
      .from("quests")
      .select("*")
      .eq("owner_id", friendId)
      .eq("visibility", "friends")
      .order("created_at", { ascending: false })
  ]);

  if (!profileResult.data) {
    return null;
  }

  const questRows = questsResult.data ?? [];
  const questIds = questRows.map((quest) => quest.id);
  let criteriaByQuest = new Map<string, QuestCriteria[]>();
  let rewardsByQuest = new Map<string, QuestStructuredItem[]>();
  let stakesByQuest = new Map<string, QuestStructuredItem[]>();

  if (questIds.length > 0) {
    const [criteriaResult, structuredItemsResult] = await Promise.all([
      supabase
        .from("quest_criteria")
        .select("*")
        .in("quest_id", questIds)
        .order("created_at", { ascending: true }),
      supabase
        .from("quest_structured_items")
        .select("*")
        .in("quest_id", questIds)
        .order("created_at", { ascending: true })
    ]);

    criteriaByQuest = (criteriaResult.data ?? []).reduce((map, row) => {
      const criteria = mapCriteria(row);
      const existing = map.get(criteria.questId) ?? [];
      existing.push(criteria);
      map.set(criteria.questId, existing);
      return map;
    }, new Map<string, QuestCriteria[]>());

    (structuredItemsResult.data ?? []).forEach((row) => {
      const item = mapStructuredItem(row);
      const targetMap = item.type === "reward" ? rewardsByQuest : stakesByQuest;
      const existing = targetMap.get(item.questId) ?? [];
      existing.push(item);
      targetMap.set(item.questId, existing);
    });
  }

  const quests: Quest[] = questRows.map((quest) =>
    mapQuest(
      quest,
      criteriaByQuest.get(quest.id) ?? [],
      rewardsByQuest.get(quest.id) ?? [],
      stakesByQuest.get(quest.id) ?? []
    )
  );

  return {
    profile: mapProfile(profileResult.data),
    progress: progressResult.data ? mapUserProgress(progressResult.data) : null,
    quests
  };
}
