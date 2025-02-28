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

interface LeaderboardTableProps {
  data: LeaderboardEntry[];
  duration: number;
}

export default function LeaderboardTable({ data, duration }: LeaderboardTableProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableCaption>
          {data.length > 0 
            ? `Top ${data.length} players for ${duration}s test` 
            : `No scores recorded for ${duration}s test yet`}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Rank</TableHead>
            <TableHead>Player</TableHead>
            <TableHead className="text-right">WPM</TableHead>
            <TableHead className="text-right">Accuracy</TableHead>
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
                <TableCell>{entry.username}</TableCell>
                <TableCell className="text-right font-semibold">{entry.wpm}</TableCell>
                <TableCell className="text-right">{typeof entry.accuracy === 'number' ? entry.accuracy.toFixed(1) : '0.0'}%</TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {formatDate(new Date(entry.created_at))}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No scores available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}