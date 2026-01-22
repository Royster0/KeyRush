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
  } | null;
};
