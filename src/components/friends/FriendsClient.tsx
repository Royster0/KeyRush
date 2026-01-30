"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
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
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-muted/40 to-muted/20 p-8 border border-border/20"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20"
          >
            <Users className="h-8 w-8 text-primary-foreground" />
          </motion.div>

          <div className="flex-1">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="text-3xl font-bold tracking-tight mb-1"
            >
              Friends
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="text-muted-foreground"
            >
              Build your crew and track your head-to-head record.
            </motion.p>
          </div>
        </div>
      </motion.div>

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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="border-border/30 bg-gradient-to-br from-muted/50 to-muted/20">
          <CardHeader className="space-y-1 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10">
                <Share2 className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-lg">Invite Friends</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-3">
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-border/50 bg-background/50 px-4 py-3">
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Friend code
                </div>
                <div className="font-mono text-lg tracking-widest flex-1 truncate font-semibold">
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
                  className="border-border/50"
                />
                <Button type="submit" disabled={isPending}>
                  <UserPlus className="h-4 w-4" />
                  Send
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="border-border/30 bg-gradient-to-br from-muted/50 to-muted/20">
          <CardHeader className="space-y-1 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10">
                <UserCheck className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-lg">Friend Requests</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
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
                    className="group rounded-xl border border-border/30 bg-background/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-semibold text-primary">
                        {getInitials(request.sender.username)}
                      </div>
                      <div>
                        <p className="font-semibold">
                          {request.sender.username}
                        </p>
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
                        onClick={() =>
                          handleRequestAction(request.id, "accepted")
                        }
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
                        className="border-border/50"
                      >
                        <X className="h-4 w-4" />
                        Decline
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card className="border-border/30 bg-gradient-to-br from-muted/50 to-muted/20">
          <CardHeader className="space-y-1 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-lg">Your Friends</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {friends.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/50 bg-background/30 p-6 text-sm text-muted-foreground text-center">
                Add friends to compare your ranked and unranked records.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {friends.map((friend, index) => {
                  const isOnline = onlineIds.has(friend.id);
                  return (
                    <motion.div
                      key={friend.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                      className="group relative overflow-hidden rounded-2xl border border-border/30 bg-gradient-to-br from-card to-card/50 p-5 hover:border-primary/30 transition-colors"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="relative z-10 flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-lg text-primary">
                              {getInitials(friend.username)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-base">
                                  {friend.username}
                                </p>
                                <span
                                  className={`h-2.5 w-2.5 rounded-full ${
                                    isOnline
                                      ? "bg-emerald-500 shadow-sm shadow-emerald-500/50"
                                      : "bg-muted-foreground/40"
                                  }`}
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
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
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
                          <div className="rounded-xl border border-border/30 bg-background/60 p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                                Ranked
                              </span>
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-lg font-bold text-emerald-500">
                                {friend.record.ranked.wins}
                              </span>
                              <span className="text-muted-foreground">-</span>
                              <span className="text-lg font-bold text-rose-500">
                                {friend.record.ranked.losses}
                              </span>
                              <span className="text-muted-foreground">-</span>
                              <span className="text-lg font-bold text-muted-foreground">
                                {friend.record.ranked.draws}
                              </span>
                            </div>
                          </div>
                          <div className="rounded-xl border border-border/30 bg-background/60 p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                                Unranked
                              </span>
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-lg font-bold text-emerald-500">
                                {friend.record.unranked.wins}
                              </span>
                              <span className="text-muted-foreground">-</span>
                              <span className="text-lg font-bold text-rose-500">
                                {friend.record.unranked.losses}
                              </span>
                              <span className="text-muted-foreground">-</span>
                              <span className="text-lg font-bold text-muted-foreground">
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
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
