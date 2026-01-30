import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { getUser, getFriendsWithRecords, getFriendRequests } from "@/app/actions";
import FriendsClient from "@/components/friends/FriendsClient";
import LoadingFriends from "@/components/friends/LoadingFriends";

const FriendsContent = async () => {
  const user = await getUser();
  if (!user) {
    redirect("/auth/login");
  }

  const [friends, requests] = await Promise.all([
    getFriendsWithRecords(),
    getFriendRequests(),
  ]);

  return (
    <FriendsClient
      currentUserId={user.id}
      friendCode={user.profile?.friend_code ?? null}
      initialFriends={friends}
      initialRequests={requests}
    />
  );
};

export default function FriendsPage() {
  return (
    <Suspense fallback={<LoadingFriends />}>
      <FriendsContent />
    </Suspense>
  );
}
