// app/profile/index.tsx
import React from "react";
import { useRouter } from "expo-router";
import { MyProfile } from "@/components/MyProfile";

export default function MyProfilePage() {
  const router = useRouter();

  return (
    <MyProfile
      onBack={() => router.back()}
      onEditProfile={() => router.push("/(user)/edit-profile")}
      onTaskClick={(id: string) => router.push(`/task-detail/${id}`)}
    />
  );
}