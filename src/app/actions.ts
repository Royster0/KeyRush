"use server";

import * as userServices from "@/lib/services/user";
import * as testResultServices from "@/lib/services/test-results";
import * as leaderboardServices from "@/lib/services/leaderboard";
import * as achievementServices from "@/lib/services/achievements";
import * as xpServices from "@/lib/services/xp";
import * as friendServices from "@/lib/services/friends";
import * as badgeServices from "@/lib/services/badges";
import { TestResults } from "@/types/game.types";
import { BadgeContext } from "@/types/badges.types";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function signOut() {
  return userServices.signOut();
}

export async function saveTestResult(result: Omit<TestResults, "user_id">) {
  return testResultServices.saveTestResult(result);
}

export async function getUser() {
  return userServices.getUser();
}

export async function getUserTestResults() {
  const user = await userServices.getUser();
  if (!user) {
    redirect("/auth/login");
  }
  return testResultServices.getUserTestResults();
}

export async function getUserBestScores() {
  const user = await userServices.getUser();
  if (!user) {
    redirect("/auth/login");
  }
  return testResultServices.getUserBestScores();
}

export async function getBestScoresSafe() {
  return testResultServices.getUserBestScores();
}

export async function getUserLeaderboardRankings() {
  const user = await userServices.getUser();
  if (!user) {
    redirect("/auth/login");
  }
  return leaderboardServices.getUserLeaderboardRankings();
}

export async function getPreSaveState() {
  const user = await userServices.getUser();
  if (!user) {
    return null;
  }
  return achievementServices.getPreSaveState();
}

export async function checkAchievements(
  wpm: number,
  duration: number,
  preSaveState: achievementServices.PreSaveState
) {
  const user = await userServices.getUser();
  if (!user) {
    return [];
  }
  return achievementServices.checkAchievements(wpm, duration, preSaveState);
}

export async function awardXp(params: {
  activeTypingSeconds: number;
  accuracy: number;
  isMultiplayer?: boolean;
  wpmMargin?: number;
}) {
  const user = await userServices.getUser();
  if (!user) {
    return null;
  }
  return xpServices.awardXp(params);
}

export async function getUserXpProgress() {
  const user = await userServices.getUser();
  if (!user) {
    return null;
  }
  return xpServices.getUserXpProgress();
}

export async function getFriendRequests() {
  const user = await userServices.getUser();
  if (!user) {
    redirect("/auth/login");
  }
  return friendServices.getFriendRequests(user.id);
}

export async function getFriendsWithRecords() {
  const user = await userServices.getUser();
  if (!user) {
    redirect("/auth/login");
  }
  return friendServices.getFriendsWithRecords(user.id);
}

export async function sendFriendRequest(username: string) {
  const result = await friendServices.sendFriendRequest(username);
  if (result.ok) {
    revalidatePath("/friends");
  }
  return result;
}

export async function respondToFriendRequest(
  requestId: string,
  action: "accepted" | "declined"
) {
  const result = await friendServices.respondToFriendRequest(requestId, action);
  if (result.ok) {
    revalidatePath("/friends");
  }
  return result;
}

export async function removeFriend(friendId: string) {
  const result = await friendServices.removeFriend(friendId);
  if (result.ok) {
    revalidatePath("/friends");
  }
  return result;
}

// Badge actions
export async function getUserBadges(userId?: string) {
  return badgeServices.getUserBadges(userId);
}

export async function getBadgesWithStatus(userId?: string) {
  return badgeServices.getBadgesWithStatus(userId);
}

export async function checkAndAwardBadges(context: Omit<BadgeContext, 'userId'>) {
  const user = await userServices.getUser();
  if (!user) {
    return [];
  }
  return badgeServices.checkAndAwardBadges({ ...context, userId: user.id });
}

export async function getUserBadgeCount(userId?: string) {
  return badgeServices.getUserBadgeCount(userId);
}

export async function getUserStatsForBadges() {
  const user = await userServices.getUser();
  if (!user) {
    return null;
  }
  return badgeServices.getUserStatsForBadges();
}

