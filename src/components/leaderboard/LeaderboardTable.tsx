"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { LeaderboardEntry } from "@/app/leaderboard/actions";
import { Badge } from "@/components/ui/badge";
import { Users, User } from "lucide-react";
import UserLink from "@/components/ui/UserLink";

interface LeaderboardTableProps {
  data: LeaderboardEntry[];
  duration: number;
}

export default function LeaderboardTable({ data, duration }: LeaderboardTableProps) {
  const showSource = duration === 30 || duration === 60;

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Rank</TableHead>
            <TableHead>Player</TableHead>
            <TableHead className="text-right">WPM</TableHead>
            <TableHead className="text-right">Accuracy</TableHead>
            {showSource && <TableHead className="w-20 text-center">Mode</TableHead>}
            <TableHead className="text-right">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((entry, index) => (
              <TableRow key={entry.test_id}>
                <TableCell className="font-medium">
                  {index === 0 ? (
                    <Badge variant="default" className="bg-yellow-500">1</Badge>
                  ) : index === 1 ? (
                    <Badge variant="secondary" className="bg-gray-400">2</Badge>
                  ) : index === 2 ? (
                    <Badge variant="secondary" className="bg-amber-700">3</Badge>
                  ) : (
                    index + 1
                  )}
                </TableCell>
                <TableCell>
                  <UserLink username={entry.username} />
                </TableCell>
                <TableCell className="text-right font-semibold">{Number(entry.wpm).toFixed(2)}</TableCell>
                <TableCell className="text-right">{typeof entry.accuracy === 'number' ? entry.accuracy.toFixed(1) : '0.0'}%</TableCell>
                {showSource && (
                  <TableCell className="text-center">
                    {entry.source === "multiplayer" ? (
                      <span className="inline-flex items-center gap-1 text-xs text-sky-500" title="Multiplayer">
                        <Users className="h-4 w-4" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground" title="Singleplayer">
                        <User className="h-4 w-4" />
                      </span>
                    )}
                  </TableCell>
                )}
                <TableCell className="text-right text-sm text-muted-foreground">
                  {formatDate(new Date(entry.created_at))}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={showSource ? 6 : 5} className="text-center text-muted-foreground">
                No recorded scores for {duration}s tests
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
