export interface UserProfile {
  id: string;
  username: string;
  created_at: string;
}

export interface TestResult {
  id: string;
  user_id: string;
  wpm: number;
  raw_wpm: number;
  accuracy: number;
  duration: number;
  text_content: string;
  created_at: string;
}

export interface TestStats {
  averageWpm: number;
  averageAccuracy: number;
  totalTests: number;
  bestWpm: number;
  recentResults: Array<{
    wpm: number;
    accuracy: number;
    created_at: string;
  }>;
}

export interface UserStatsProps {
  userId?: string;
}
