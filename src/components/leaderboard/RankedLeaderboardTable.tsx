"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { RankedPlayer } from "@/lib/services/leaderboard";
import { getRankColor } from "@/components/multiplayer/multiplayer-utils";
import { getRankLabel } from "@/lib/multiplayer";

interface RankedLeaderboardTableProps {
  data: RankedPlayer[];
  currentUserId?: string;
}

function getPositionSuffix(position: number): string {
  if (position % 100 >= 11 && position % 100 <= 13) return "th";
  if (position % 10 === 1) return "st";
  if (position % 10 === 2) return "nd";
  if (position % 10 === 3) return "rd";
  return "th";
}

export default function RankedLeaderboardTable({ data, currentUserId }: RankedLeaderboardTableProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Rank</TableHead>
            <TableHead className="w-16">Tier</TableHead>
            <TableHead>Player</TableHead>
            <TableHead className="text-right">Rating</TableHead>
            <TableHead className="text-right">Matches</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((player, index) => {
              const position = index + 1;
              const rankTier = player.rank_tier || getRankLabel(player.elo, player.matches_played);
              const isCurrentUser = currentUserId && player.user_id === currentUserId;

              return (
                <TableRow
                  key={player.user_id}
                  className={isCurrentUser ? "bg-primary/10 hover:bg-primary/15" : ""}
                >
                  <TableCell className="font-medium">
                    {position === 1 ? (
                      <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-500">
                        1st
                      </Badge>
                    ) : position === 2 ? (
                      <Badge variant="secondary" className="bg-gray-400 hover:bg-gray-400">
                        2nd
                      </Badge>
                    ) : position === 3 ? (
                      <Badge variant="secondary" className="bg-amber-700 hover:bg-amber-700">
                        3rd
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">
                        {position}{getPositionSuffix(position)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Trophy className={`h-5 w-5 ${getRankColor(rankTier)}`} />
                  </TableCell>
                  <TableCell className="font-medium">{player.username}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {Math.round(player.elo)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {player.matches_played}
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                No ranked players found. Play 5 ranked matches to appear on the leaderboard!
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
