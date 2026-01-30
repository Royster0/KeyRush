import { createClient } from "@/utils/supabase/server";
import {
  FriendMatchRowSchema,
  FriendRequestRowSchema,
  FriendshipRowSchema,
} from "@/lib/schemas/friends";
import type {
  FriendActionResult,
  FriendRecord,
  FriendRecordSegment,
  FriendRequest,
  FriendSummary,
  SendFriendRequestResult,
} from "@/types/friends.types";

function createRecordSegment(): FriendRecordSegment {
  return { wins: 0, losses: 0, draws: 0, total: 0 };
}

function createEmptyRecord(): FriendRecord {
  return { ranked: createRecordSegment(), unranked: createRecordSegment() };
}

function isUnrankedMatch(partyMatchId?: string | null) {
  return Boolean(partyMatchId && partyMatchId.includes("-unranked-"));
}

export async function getFriendRequests(userId?: string): Promise<FriendRequest[]> {
  const supabase = await createClient();
  let resolvedUserId = userId;
  if (!resolvedUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    resolvedUserId = user.id;
  }

  const { data, error } = await supabase
    .from("friend_requests")
    .select(
      `
        id,
        sender_id,
        receiver_id,
        status,
        created_at,
        sender:profiles!friend_requests_sender_id_fkey (
          id,
          username,
          level,
          rank_tier,
          elo
        )
      `
    )
    .eq("receiver_id", resolvedUserId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  const parsed = FriendRequestRowSchema.array().safeParse(data);
  if (!parsed.success) {
    return [];
  }

  return parsed.data.map((row) => ({
    id: row.id,
    created_at: row.created_at,
    sender: {
      id: row.sender.id,
      username: row.sender.username || "Anonymous",
      level: row.sender.level ?? 1,
      rank_tier: row.sender.rank_tier ?? null,
      elo: row.sender.elo ?? null,
    },
  }));
}

export async function getFriendsWithRecords(userId?: string): Promise<FriendSummary[]> {
  const supabase = await createClient();
  let resolvedUserId = userId;
  if (!resolvedUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    resolvedUserId = user.id;
  }

  const { data, error } = await supabase
    .from("friendships")
    .select(
      `
        friend_id,
        friend:profiles!friendships_friend_id_fkey (
          id,
          username,
          level,
          rank_tier,
          elo
        )
      `
    )
    .eq("user_id", resolvedUserId);

  if (error || !data) {
    return [];
  }

  const parsed = FriendshipRowSchema.array().safeParse(data);
  if (!parsed.success) {
    return [];
  }

  const friends = parsed.data.map((row) => ({
    id: row.friend.id,
    username: row.friend.username || "Anonymous",
    level: row.friend.level ?? 1,
    rank_tier: row.friend.rank_tier ?? null,
    elo: row.friend.elo ?? null,
  }));

  friends.sort((a, b) => a.username.localeCompare(b.username));

  if (friends.length === 0) {
    return [];
  }

  const friendIds = friends.map((friend) => friend.id);
  const friendIdList = friendIds.join(",");
  const { data: matchData } = await supabase
    .from("matches")
    .select("id, party_match_id, player1_id, player2_id, winner_id")
    .or(
      `and(player1_id.eq.${resolvedUserId},player2_id.in.(${friendIdList})),and(player2_id.eq.${resolvedUserId},player1_id.in.(${friendIdList}))`
    );

  const recordsByFriend = new Map<string, FriendRecord>();
  for (const friend of friends) {
    recordsByFriend.set(friend.id, createEmptyRecord());
  }

  if (matchData) {
    const parsedMatches = FriendMatchRowSchema.array().safeParse(matchData);
    if (parsedMatches.success) {
      for (const match of parsedMatches.data) {
        const player1 = match.player1_id;
        const player2 = match.player2_id;
        if (!player1 || !player2) continue;

        const friendId = player1 === resolvedUserId ? player2 : player1;
        if (!recordsByFriend.has(friendId)) continue;

        const record = recordsByFriend.get(friendId)!;
        const bucket = isUnrankedMatch(match.party_match_id)
          ? record.unranked
          : record.ranked;

        bucket.total += 1;

        if (!match.winner_id) {
          bucket.draws += 1;
          continue;
        }

        if (match.winner_id === resolvedUserId) {
          bucket.wins += 1;
        } else if (match.winner_id === friendId) {
          bucket.losses += 1;
        } else {
          bucket.draws += 1;
        }
      }
    }
  }

  return friends.map((friend) => ({
    ...friend,
    record: recordsByFriend.get(friend.id) ?? createEmptyRecord(),
  }));
}

export async function sendFriendRequest(username: string): Promise<SendFriendRequestResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be logged in to add friends." };
  }

  const cleaned = username.trim();
  if (!cleaned) {
    return { ok: false, error: "Enter a username to send an invite." };
  }

  const { data: receiverByCode } = await supabase
    .from("profiles")
    .select("id, username, friend_code")
    .ilike("friend_code", cleaned)
    .single();

  const receiver =
    receiverByCode ??
    (
      await supabase
        .from("profiles")
        .select("id, username, friend_code")
        .ilike("username", cleaned)
        .single()
    ).data;

  if (!receiver) {
    return { ok: false, error: "User not found. Check the username or friend code." };
  }

  if (receiver.id === user.id) {
    return { ok: false, error: "You cannot add yourself." };
  }

  const { data: existingFriends } = await supabase
    .from("friendships")
    .select("id")
    .eq("user_id", user.id)
    .eq("friend_id", receiver.id)
    .limit(1);

  if (existingFriends && existingFriends.length > 0) {
    return { ok: false, error: "You're already friends with this user." };
  }

  const { data: existingRequests } = await supabase
    .from("friend_requests")
    .select("id, status")
    .eq("status", "pending")
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${receiver.id}),and(sender_id.eq.${receiver.id},receiver_id.eq.${user.id})`
    );

  if (existingRequests && existingRequests.length > 0) {
    return { ok: false, error: "A pending request already exists." };
  }

  const { error } = await supabase.from("friend_requests").insert({
    sender_id: user.id,
    receiver_id: receiver.id,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "A request already exists." };
    }
    return { ok: false, error: "Could not send friend request. Try again." };
  }

  return {
    ok: true,
    receiverId: receiver.id,
    receiverName: receiver.username || "User",
  };
}

export async function respondToFriendRequest(
  requestId: string,
  action: "accepted" | "declined"
): Promise<FriendActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be logged in to respond." };
  }

  if (action !== "accepted" && action !== "declined") {
    return { ok: false, error: "Invalid request action." };
  }

  const { data: request, error: requestError } = await supabase
    .from("friend_requests")
    .select("id, sender_id, receiver_id, status")
    .eq("id", requestId)
    .single();

  if (requestError || !request) {
    return { ok: false, error: "Friend request not found." };
  }

  if (request.receiver_id !== user.id) {
    return { ok: false, error: "You cannot respond to this request." };
  }

  if (request.status !== "pending") {
    return { ok: false, error: "This request has already been handled." };
  }

  if (action === "declined") {
    const { error } = await supabase
      .from("friend_requests")
      .update({ status: "declined" })
      .eq("id", requestId);

    if (error) {
      return { ok: false, error: "Could not decline the request." };
    }

    return { ok: true };
  }

  const { data: existingFriendships } = await supabase
    .from("friendships")
    .select("id")
    .or(
      `and(user_id.eq.${request.receiver_id},friend_id.eq.${request.sender_id}),and(user_id.eq.${request.sender_id},friend_id.eq.${request.receiver_id})`
    )
    .limit(1);

  if (!existingFriendships || existingFriendships.length === 0) {
    const { error: insertError } = await supabase.from("friendships").insert([
      { user_id: request.receiver_id, friend_id: request.sender_id },
      { user_id: request.sender_id, friend_id: request.receiver_id },
    ]);

    if (insertError) {
      return { ok: false, error: "Could not create friendship." };
    }
  }

  const { error: updateError } = await supabase
    .from("friend_requests")
    .update({ status: "accepted" })
    .eq("id", requestId);

  if (updateError) {
    return { ok: false, error: "Could not accept the request." };
  }

  return { ok: true };
}

export async function removeFriend(friendId: string): Promise<FriendActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be logged in to remove friends." };
  }

  if (!friendId) {
    return { ok: false, error: "Missing friend id." };
  }

  const { error } = await supabase
    .from("friendships")
    .delete()
    .or(
      `and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`
    );

  if (error) {
    return { ok: false, error: "Could not remove friend. Please try again." };
  }

  return { ok: true };
}
