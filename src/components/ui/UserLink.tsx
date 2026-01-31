"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface UserLinkProps {
  username: string;
  className?: string;
  children?: React.ReactNode;
}

export default function UserLink({
  username,
  className,
  children,
}: UserLinkProps) {
  const safeUsername = encodeURIComponent(username);

  return (
    <Link
      href={`/u/${safeUsername}`}
      className={cn(
        "text-foreground hover:text-primary hover:underline underline-offset-4 transition-colors",
        className
      )}
    >
      {children ?? username}
    </Link>
  );
}
