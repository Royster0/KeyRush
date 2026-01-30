"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Check, Copy, Trash2, UserPlus, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { sendFriendRequest, respondToFriendRequest, removeFriend } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RankIcon } from "@/components/RankIcon";
import { formatDate } from "@/lib/utils";
import type {
  FriendRecordSegment,
  FriendRequest,
  FriendSummary,
} from "@/types/friends.types";

type FriendsClientProps = {
  currentUserId: string;
  friendCode?: string | null;
  initialFriends: FriendSummary[];
  initialRequests: FriendRequest[];
};

function formatRecord(record: FriendRecordSegment) {
  return `${record.wins}-${record.losses}-${record.draws}`;
}

function getInitials(name: string) {
  return name?.trim().charAt(0).toUpperCase() || "?";
}

export default function FriendsClient({
  currentUserId,
  friendCode,
  initialFriends,
  initialRequests,
}: FriendsClientProps) {
  const router = useRouter();
  const [inviteName, setInviteName] = useState("");
  const [requests, setRequests] = useState<FriendRequest[]>(initialRequests);
  const [friends, setFriends] = useState<FriendSummary[]>(initialFriends);
  const [isPending, startTransition] = useTransition();
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());
  const [removeTarget, setRemoveTarget] = useState<{
    id: string;
    username: string;
  } | null>(null);

  useEffect(() => {
    setRequests(initialRequests);
  }, [initialRequests]);

  useEffect(() => {
    setFriends(initialFriends);
  }, [initialFriends]);

  useEffect(() => {
    if (!currentUserId) return;

    const supabase = createClient();
    const channel = supabase.channel("online-users", {
      config: { presence: { key: currentUserId } },
    });

    const syncOnline = () => {
      const state = channel.presenceState() as Record<
        string,
        { user_id?: string }[]
      >;
      const next = new Set<string>();
      Object.values(state).forEach((presences) => {
        presences.forEach((presence) => {
          if (presence.user_id) {
            next.add(presence.user_id);
          }
        });
      });
      setOnlineIds(next);
    };

    channel.on("presence", { event: "sync" }, syncOnline);
    channel.on("presence", { event: "join" }, syncOnline);
    channel.on("presence", { event: "leave" }, syncOnline);

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        channel.track({ user_id: currentUserId });
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  const friendCountLabel = useMemo(() => {
    if (friends.length === 0) return "No friends yet";
    if (friends.length === 1) return "1 friend";
    return `${friends.length} friends`;
  }, [friends.length]);

  const handleInviteSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const target = inviteName.trim();
    if (!target) {
      toast.error("Enter a username to send an invite.");
      return;
    }

    startTransition(async () => {
      const result = await sendFriendRequest(target);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`Invite sent to ${result.receiverName}.`);
      setInviteName("");
      router.refresh();
    });
  };

  const handleRequestAction = (requestId: string, action: "accepted" | "declined") => {
    startTransition(async () => {
      const result = await respondToFriendRequest(requestId, action);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setRequests((prev) => prev.filter((request) => request.id !== requestId));
      toast.success(action === "accepted" ? "Friend added!" : "Request declined.");
      router.refresh();
    });
  };

  const handleRemoveFriend = (friendId: string, friendName: string) => {
    startTransition(async () => {
      const result = await removeFriend(friendId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setFriends((prev) => prev.filter((friend) => friend.id !== friendId));
      toast.success(`${friendName} removed.`);
      router.refresh();
      setRemoveTarget(null);
    });
  };

  const handleCopyFriendCode = async () => {
    if (!friendCode) {
      toast.error("No friend code available yet.");
      return;
    }
    try {
      await navigator.clipboard.writeText(friendCode);
      toast.success("Friend code copied.");
    } catch {
      toast.error("Could not copy friend code.");
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Friends</h1>
        <p className="text-muted-foreground">Build your crew and track your head-to-head record.</p>
      </header>

      <Dialog
        open={Boolean(removeTarget)}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove friend</DialogTitle>
            <DialogDescription>
              {removeTarget
                ? `Remove ${removeTarget.username} from your friends? This will remove the connection for both of you.`
                : "Remove this friend from your list?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRemoveTarget(null)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                removeTarget && handleRemoveFriend(removeTarget.id, removeTarget.username)
              }
              disabled={!removeTarget || isPending}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="border-border/60">
        <CardHeader className="space-y-1 pb-3">
          <CardTitle className="text-lg">Invite friends</CardTitle>
          <p className="text-sm text-muted-foreground">
            Share your code or invite by username or friend code.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-3">
            <div className="flex items-center gap-3 rounded-lg border border-dashed border-border/70 px-3 py-2">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Friend code
              </div>
              <div className="font-mono text-sm tracking-wider flex-1 truncate">
                {friendCode || "Not set"}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!friendCode}
                onClick={handleCopyFriendCode}
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            </div>
            <form onSubmit={handleInviteSubmit} className="flex gap-3">
              <Input
                placeholder="Username or friend code"
                value={inviteName}
                onChange={(event) => setInviteName(event.target.value)}
                autoComplete="off"
              />
              <Button type="submit" disabled={isPending}>
                <UserPlus className="h-4 w-4" />
                Send
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="space-y-1 pb-3">
          <CardTitle className="text-lg">Friend Requests</CardTitle>
          <p className="text-sm text-muted-foreground">
            {requests.length === 0
              ? "No pending requests."
              : `${requests.length} pending`}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {requests.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/70 p-4 text-sm text-muted-foreground text-center">
              Requests will appear here when someone sends you an invite.
            </div>
          ) : (
            requests.map((request) => (
              <div
                key={request.id}
                className="rounded-lg border border-border/60 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-semibold">
                    {getInitials(request.sender.username)}
                  </div>
                  <div>
                    <p className="font-semibold">{request.sender.username}</p>
                    <p className="text-xs text-muted-foreground">
                      Level {request.sender.level} ·{" "}
                      {request.sender.rank_tier ?? "Unranked"} ·{" "}
                      {formatDate(new Date(request.created_at))}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleRequestAction(request.id, "accepted")}
                  >
                    <Check className="h-4 w-4" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isPending}
                    onClick={() => handleRequestAction(request.id, "declined")}
                  >
                    <X className="h-4 w-4" />
                    Decline
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="space-y-1 pb-3">
          <CardTitle className="text-lg">Your Friends</CardTitle>
          <p className="text-sm text-muted-foreground">{friendCountLabel}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {friends.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/70 p-4 text-sm text-muted-foreground text-center">
              Add friends to compare your ranked and unranked records.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {friends.map((friend) => {
                const isOnline = onlineIds.has(friend.id);
                return (
                  <div
                    key={friend.id}
                    className="rounded-lg border border-border/60 p-4 flex flex-col gap-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-full bg-muted flex items-center justify-center font-semibold">
                          {getInitials(friend.username)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{friend.username}</p>
                            <span
                              className={`h-2 w-2 rounded-full ${
                                isOnline ? "bg-emerald-500" : "bg-muted-foreground/40"
                              }`}
                            />
                            <span className="text-xs text-muted-foreground">
                              {isOnline ? "Online" : "Offline"}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">Level {friend.level}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <RankIcon rank={friend.rank_tier} size={20} />
                        <span>{friend.rank_tier ?? "Unranked"}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            setRemoveTarget({ id: friend.id, username: friend.username })
                          }
                          aria-label={`Remove ${friend.username}`}
                          title="Remove friend"
                          disabled={isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="rounded-md border border-border/60 bg-muted/40 px-3 py-2 flex items-center justify-between">
                        <span className="text-muted-foreground">Ranked</span>
                        <span className="flex items-center gap-2">
                          <span className="font-semibold">
                            {formatRecord(friend.record.ranked)}
                          </span>
                          <span className="text-[10px] uppercase text-muted-foreground">W-L-D</span>
                        </span>
                      </div>
                      <div className="rounded-md border border-border/60 bg-muted/40 px-3 py-2 flex items-center justify-between">
                        <span className="text-muted-foreground">Unranked</span>
                        <span className="flex items-center gap-2">
                          <span className="font-semibold">
                            {formatRecord(friend.record.unranked)}
                          </span>
                          <span className="text-[10px] uppercase text-muted-foreground">W-L-D</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
