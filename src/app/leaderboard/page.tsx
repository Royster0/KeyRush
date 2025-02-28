import { LeaderboardTimeframe } from "./actions";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDuration } from "@/lib/utils";
import LeaderboardTable from "@/components/leaderboard/LeaderboardTable";
import { TIME_OPTIONS } from "@/lib/constants";
import LeaderboardClient from "@/components/leaderboard/LeaderboardClient";

export default function LeaderboardPage() {
  return (
    <LeaderboardClient />
  );
}
