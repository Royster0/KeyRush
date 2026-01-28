"use server";

import * as userServices from "@/lib/services/user";
import * as testResultServices from "@/lib/services/test-results";
import * as leaderboardServices from "@/lib/services/leaderboard";
import * as achievementServices from "@/lib/services/achievements";
import { TestResults } from "@/types/game.types";
import { redirect } from "next/navigation";

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

