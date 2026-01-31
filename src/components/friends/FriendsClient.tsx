"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";
import {
  Check,
  Copy,
  Trash2,
  UserPlus,
  X,
  Users,
  UserCheck,
  Share2,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import {
  sendFriendRequest,
  respondToFriendRequest,
  removeFriend,
} from "@/app/actions";
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
import UserLink from "@/components/ui/UserLink";
import type { FriendRequest, FriendSummary } from "@/types/friends.types";

type FriendsClientProps = {
  currentUserId: string;
  friendCode?: string | null;
  initialFriends: FriendSummary[];
  initialRequests: FriendRequest[];
};

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

  const handleRequestAction = (
    requestId: string,
    action: "accepted" | "declined",
  ) => {
    startTransition(async () => {
      const result = await respondToFriendRequest(requestId, action);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setRequests((prev) => prev.filter((request) => request.id !== requestId));
      toast.success(
        action === "accepted" ? "Friend added!" : "Request declined.",
      );
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
    <div className="min-h-screen">
      <div className="container mx-auto max-w-6xl px-4 py-12 space-y-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative text-center space-y-4"
        >
          {/* Background glow */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[200px] w-[400px] rounded-full bg-primary/8 blur-[80px]" />
          </div>

          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Friends
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto mt-4">
              Build your crew and track your head-to-head record.
            </p>
          </div>
        </motion.header>

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
                  removeTarget &&
                  handleRemoveFriend(removeTarget.id, removeTarget.username)
                }
                disabled={!removeTarget || isPending}
              >
                Remove
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-8">
          {/* Left Column - Invite & Requests */}
          <div className="space-y-8">
            {/* Invite Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Share2 className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-xl font-mono uppercase tracking-[0.15em]">
                  Invite
                </h2>
              </div>

              <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/40 p-5 space-y-4">
                <div className="flex items-center gap-3 rounded-xl border border-dashed border-border/50 bg-background/50 px-4 py-3">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium whitespace-nowrap">
                    Your Code
                  </div>
                  <div className="font-mono text-base tracking-widest flex-1 truncate font-semibold">
                    {friendCode || "Not set"}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!friendCode}
                    onClick={handleCopyFriendCode}
                    className="border-border/50"
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
                    className="border-border/50 bg-background/50"
                  />
                  <Button type="submit" disabled={isPending}>
                    <UserPlus className="h-4 w-4" />
                    Send
                  </Button>
                </form>
              </div>
            </motion.section>

            {/* Friend Requests Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <UserCheck className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-xl font-mono uppercase tracking-[0.15em]">
                  Requests
                </h2>
                {requests.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {requests.length}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {requests.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="rounded-xl border border-dashed border-border/50 bg-background/30 p-6 text-sm text-muted-foreground text-center"
                    >
                      Requests will appear here when someone sends you an invite.
                    </motion.div>
                  ) : (
                    requests.map((request, index) => (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="group relative overflow-hidden rounded-xl bg-card/50 backdrop-blur-sm border border-border/40 p-4 hover:border-primary/30 transition-colors"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative z-10 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-semibold text-primary">
                              {getInitials(request.sender.username)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <UserLink
                                username={request.sender.username}
                                className="font-semibold"
                              />
                              <p className="text-xs text-muted-foreground truncate">
                                Lvl {request.sender.level} ·{" "}
                                {request.sender.rank_tier ?? "Unranked"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              disabled={isPending}
                              onClick={() =>
                                handleRequestAction(request.id, "accepted")
                              }
                              className="flex-1"
                            >
                              <Check className="h-4 w-4" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isPending}
                              onClick={() =>
                                handleRequestAction(request.id, "declined")
                              }
                              className="border-border/50 flex-1"
                            >
                              <X className="h-4 w-4" />
                              Decline
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </motion.section>
          </div>

          {/* Right Column - Friends List */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-xl font-mono uppercase tracking-[0.15em]">
                Your Friends
              </h2>
              {friends.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {friends.length}
                </span>
              )}
            </div>

            {friends.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/50 bg-background/30 p-8 text-sm text-muted-foreground text-center">
                Add friends to compare your ranked and unranked records.
              </div>
            ) : (
              <div className="space-y-3">
                {friends.map((friend, index) => {
                  const isOnline = onlineIds.has(friend.id);
                  return (
                    <motion.div
                      key={friend.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.25 + index * 0.05 }}
                      className="group relative overflow-hidden rounded-2xl bg-card/50 backdrop-blur-sm border border-border/40 p-5 hover:border-primary/30 transition-colors"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="relative z-10 flex flex-col gap-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-lg text-primary">
                                {getInitials(friend.username)}
                              </div>
                              {/* Online indicator dot */}
                              <span
                                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card ${
                                  isOnline
                                    ? "bg-emerald-500 shadow-sm shadow-emerald-500/50"
                                    : "bg-muted-foreground/40"
                                }`}
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <UserLink
                                  username={friend.username}
                                  className="font-semibold text-base"
                                />
                                <span
                                  className={`text-xs ${isOnline ? "text-emerald-500" : "text-muted-foreground"}`}
                                >
                                  {isOnline ? "Online" : "Offline"}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Level {friend.level}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/30 border border-border/30">
                              <RankIcon rank={friend.rank_tier} size={18} />
                              <span className="text-xs font-medium">
                                {friend.rank_tier ?? "Unranked"}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() =>
                                setRemoveTarget({
                                  id: friend.id,
                                  username: friend.username,
                                })
                              }
                              aria-label={`Remove ${friend.username}`}
                              title="Remove friend"
                              disabled={isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                                Ranked
                              </span>
                            </div>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-xl font-bold tabular-nums text-emerald-500">
                                {friend.record.ranked.wins}
                              </span>
                              <span className="text-muted-foreground/60">-</span>
                              <span className="text-xl font-bold tabular-nums text-rose-500">
                                {friend.record.ranked.losses}
                              </span>
                              <span className="text-muted-foreground/60">-</span>
                              <span className="text-xl font-bold tabular-nums text-muted-foreground">
                                {friend.record.ranked.draws}
                              </span>
                            </div>
                          </div>
                          <div className="rounded-xl border border-border/30 bg-muted/20 p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                                Unranked
                              </span>
                            </div>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-xl font-bold tabular-nums text-emerald-500">
                                {friend.record.unranked.wins}
                              </span>
                              <span className="text-muted-foreground/60">-</span>
                              <span className="text-xl font-bold tabular-nums text-rose-500">
                                {friend.record.unranked.losses}
                              </span>
                              <span className="text-muted-foreground/60">-</span>
                              <span className="text-xl font-bold tabular-nums text-muted-foreground">
                                {friend.record.unranked.draws}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.section>
        </div>
      </div>
    </div>
  );
}
