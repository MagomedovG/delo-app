import React from "react";
import { useRouter } from "expo-router";
import { Home } from "@/components/Home";
import { useApp } from "@/context/AppContext";

export default function HomeScreen() {
  const router = useRouter();
  const { setSelectedCategory } = useApp();

  const handleCategoryClick = (categoryId: string) => {
    const names: Record<string, string> = {
      repair: "Ремонт и строительство",
      delivery: "Доставка",
      courier: "Курьерские поручения",
      cleaning: "Уборка",
      education: "Репетиторы и обучение",
      it: "IT и цифровые услуги",
      beauty: "Красота и здоровье",
      media: "Фото / Видео / Дизайн",
      auto: "Автоуслуги",
      legal: "Юридические и финансовые",
      other: "Прочее",
    };

    setSelectedCategory({ id: categoryId, name: names[categoryId] });
    router.push("/task-list");
  };
  const handleTaskClick = (taskId: string) => {
    // console.log('taskId',taskId)
    router.push(`/task-detail/${taskId}`);
  };
  return (
    <Home
      onCategoryClick={handleCategoryClick}
      onTaskClick={handleTaskClick}
      onCreateTask={() => router.push("/create-task")}
      onViewOffers={() => router.push("/my-offers")}
      onViewProfile={() => router.push("/my-profile")}
    />
  );
}
