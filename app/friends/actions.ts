"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function sendFriendRequestAction(formData: FormData) {
  const user = await requireUser();
  const supabase = createClient();
  const rawSearch = String(formData.get("friend_search") ?? "").trim();
  const search = rawSearch.replace(/^@/, "");

  if (!search) {
    return;
  }

  const { data: target } = await supabase
    .from("profiles")
    .select("id, username")
    .or(`username.ilike.${search},display_name.ilike.${search}`)
    .neq("id", user.id)
    .limit(1)
    .maybeSingle();

  if (!target) {
    return;
  }

  const { data: existing } = await supabase
    .from("friendships")
    .select("id")
    .or(
      `and(requester_id.eq.${user.id},receiver_id.eq.${target.id}),and(requester_id.eq.${target.id},receiver_id.eq.${user.id})`
    )
    .maybeSingle();

  if (existing) {
    return;
  }

  await supabase.from("friendships").insert({
    requester_id: user.id,
    receiver_id: target.id,
    status: "pending"
  });

  revalidatePath("/friends");
}

export async function acceptFriendRequestAction(formData: FormData) {
  await updateIncomingFriendship(formData, "accepted");
}

export async function rejectFriendRequestAction(formData: FormData) {
  await updateIncomingFriendship(formData, "rejected");
}

async function updateIncomingFriendship(
  formData: FormData,
  status: "accepted" | "rejected"
) {
  const user = await requireUser();
  const supabase = createClient();
  const friendshipId = String(formData.get("friendship_id") ?? "");

  if (!friendshipId) {
    return;
  }

  await supabase
    .from("friendships")
    .update({ status })
    .eq("id", friendshipId)
    .eq("receiver_id", user.id);

  revalidatePath("/friends");
}
