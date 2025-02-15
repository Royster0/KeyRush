export interface TestResults {
  id?: string;
  user_id: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  duration: number;
  created_at?: string;
}
