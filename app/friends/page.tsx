import { Check, Clock, Flame, Search, UserPlus, X } from "lucide-react";
import {
  acceptFriendRequestAction,
  rejectFriendRequestAction,
  sendFriendRequestAction
} from "@/app/friends/actions";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireUser } from "@/lib/auth";
import { getFriendsData, type FriendConnection } from "@/lib/friends";
import { ensureProgressAndSkills } from "@/lib/profile-bootstrap";
import { getRankName } from "@/lib/ranks";
import { getDashboardData } from "@/lib/supabase/queries";

export default async function FriendsPage() {
  const user = await requireUser();
  await ensureProgressAndSkills(user.id);
  const [{ profile }, friends] = await Promise.all([
    getDashboardData(user.id),
    getFriendsData(user.id)
  ]);

  if (!profile) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar profile={profile} />

      <main className="w-full px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <section className="min-w-0 space-y-6">
            <header className="rounded-lg border border-border bg-card/70 p-5 shadow-sm">
              <Badge tone="default">Party Finder</Badge>
              <h1 className="mt-3 text-3xl font-bold">Friends</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Keep your trusted party close for visible quests and proof verification.
              </p>
            </header>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Friends</h2>
                <Badge tone="muted">{friends.accepted.length} Linked</Badge>
              </div>
              <div className="grid gap-4">
                {friends.accepted.length > 0 ? (
                  friends.accepted.map((friend) => (
                    <FriendCard key={friend.friendshipId} friend={friend} />
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-border bg-card/45 p-6 text-sm text-muted-foreground">
                    No friends yet. Send a request from the sidebar.
                  </div>
                )}
              </div>
            </section>
          </section>

          <aside className="space-y-6">
            <AddFriendPanel />
            <RequestPanel
              title="Incoming"
              empty="No incoming requests."
              connections={friends.incoming}
              variant="incoming"
            />
            <RequestPanel
              title="Outgoing"
              empty="No outgoing requests."
              connections={friends.outgoing}
              variant="outgoing"
            />
          </aside>
        </div>
      </main>
    </div>
  );
}

function AddFriendPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <UserPlus className="h-4 w-4 text-primary" />
          Add Friend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-3" action={sendFriendRequestAction}>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              name="friend_search"
              placeholder="Username or display name"
              required
            />
          </div>
          <Button className="w-full" type="submit">
            Send Request
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function FriendCard({ friend }: { friend: FriendConnection }) {
  const progress = friend.progress ?? { rankTier: 0, lp: 0, currentStreak: 0 };
  const counts = friend.activeQuestCounts ?? { main: 0, side: 0, boss: 0 };

  return (
    <button
      type="button"
      className="group w-full rounded-lg border border-border bg-card/80 p-4 text-left transition hover:border-primary/50 hover:shadow-glow"
      aria-label={`Open ${friend.profile.displayName}'s profile`}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md border border-border bg-secondary text-sm font-bold text-primary">
            {friend.profile.displayName.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <div className="truncate text-base font-semibold">
                {friend.profile.displayName}
              </div>
              <div className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-amber-300">
                <Flame className="h-3.5 w-3.5" />
                {progress.currentStreak}
              </div>
            </div>
            <div className="mt-1 truncate text-xs text-muted-foreground">
              Target quest: Not selected
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <div className="min-w-28">
            <div className="text-[11px] font-semibold uppercase text-muted-foreground">
              Rank
            </div>
            <div className="text-sm font-semibold text-primary">
              {getRankName(progress.rankTier)}
            </div>
            <div className="text-xs text-muted-foreground">{progress.lp} LP</div>
          </div>

          <div className="flex items-center gap-5">
            <QuestCount label="S" value={counts.side} className="text-primary" />
            <QuestCount label="M" value={counts.main} className="text-amber-300" />
            <QuestCount label="B" value={counts.boss} className="text-red-300" />
          </div>
        </div>
      </div>
    </button>
  );
}

function QuestCount({
  label,
  value,
  className
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className="text-center">
      <div className={`text-[11px] font-bold ${className}`}>{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function RequestPanel({
  title,
  empty,
  connections,
  variant
}: {
  title: string;
  empty: string;
  connections: FriendConnection[];
  variant: "incoming" | "outgoing";
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {connections.length > 0 ? (
          connections.map((connection) => (
            <div
              key={connection.friendshipId}
              className="rounded-md border border-border bg-secondary/40 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">
                    {connection.profile.displayName}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    @{connection.profile.username}
                  </div>
                </div>

                {variant === "outgoing" ? (
                  <Badge tone="warning">
                    <Clock className="mr-1 h-3 w-3" />
                    Pending
                  </Badge>
                ) : null}
              </div>

              {variant === "incoming" ? (
                <div className="mt-3 flex gap-2">
                  <form className="flex-1" action={acceptFriendRequestAction}>
                    <input
                      type="hidden"
                      name="friendship_id"
                      value={connection.friendshipId}
                    />
                    <Button className="w-full" size="sm" type="submit">
                      <Check className="h-3.5 w-3.5" />
                      Accept
                    </Button>
                  </form>
                  <form className="flex-1" action={rejectFriendRequestAction}>
                    <input
                      type="hidden"
                      name="friendship_id"
                      value={connection.friendshipId}
                    />
                    <Button className="w-full" size="sm" variant="outline" type="submit">
                      <X className="h-3.5 w-3.5" />
                      Reject
                    </Button>
                  </form>
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <div className="rounded-md border border-dashed border-border bg-card/45 p-4 text-sm text-muted-foreground">
            {empty}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
