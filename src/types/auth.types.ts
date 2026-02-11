export interface AuthFormProps {
  redirectTo?: string;
}

export interface AuthError {
  message: string;
}

import { User } from "@supabase/supabase-js";

export type UserWithProfile = User & {
  profile?: {
    username: string;
    created_at: string;
    elo?: number | null;
    rank_tier?: string | null;
    matches_played?: number | null;
    wins?: number | null;
    losses?: number | null;
    total_xp?: number | null;
    level?: number | null;
    friend_code?: string | null;
    active_banner_slot?: number | null;
    peak_rank_tier?: string | null;
  } | null;
};
