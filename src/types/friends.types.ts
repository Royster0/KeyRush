export type FriendRecordSegment = {
  wins: number;
  losses: number;
  draws: number;
  total: number;
};

export type FriendRecord = {
  ranked: FriendRecordSegment;
  unranked: FriendRecordSegment;
};

export type FriendProfile = {
  id: string;
  username: string;
  level: number;
  rank_tier: string | null;
  elo: number | null;
  last_active_at: string | null;
};

export type FriendSummary = FriendProfile & {
  record: FriendRecord;
};

export type FriendRequest = {
  id: string;
  created_at: string;
  sender: FriendProfile;
};

export type FriendActionResult =
  | { ok: true }
  | { ok: false; error: string };

export type SendFriendRequestResult =
  | { ok: true; receiverId: string; receiverName: string }
  | { ok: false; error: string };
