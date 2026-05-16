import { createClient } from "@/lib/supabase/server";
import { mapProfile } from "@/lib/supabase/mappers";
import type { FriendshipStatus, Profile, UserProgress } from "@/lib/types";

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
