// app/task-list.tsx
import React from "react";
import { useRouter } from "expo-router";
import { TaskList } from "@/components/TaskList";
import { useApp } from "@/context/AppContext";

export default function TaskListPage() {
  const router = useRouter();
  const { selectedCategory, setSelectedTaskId } = useApp();

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    // console.log('taskId',taskId)
    router.push(`/task-detail/${taskId}`);
  };

  return (
    <TaskList
      categoryId={selectedCategory?.id}
      categoryName={selectedCategory?.name}
      onBack={() => router.push("/home")}
      onTaskClick={handleTaskClick}
    />
  );
}
