import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { Check, ArrowLeft } from "lucide-react-native";
import { MotiView } from "moti";

interface OnboardingCompleteProps {
  role?: "poster" | "tasker";
  onComplete: () => void;
  onBack: () => void;
}

export function OnboardingComplete({ role = 'poster', onComplete, onBack }: OnboardingCompleteProps) {
  const isPoster = role === "poster";

  const steps = isPoster
    ? [
        "Заполните свой профиль",
        "Опубликуйте своё первое задание",
        "Просмотрите предложения от исполнителей",
        "Наймите исполнителя и получите результат",
      ]
    : [
        "Заполните профиль и подтвердите личность",
        "Просмотрите доступные задания",
        "Делайте предложения на подходящие задания",
        "Выполняйте задания и зарабатывайте",
      ];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <MotiView
            from={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "timing", duration: 400 }}
            style={styles.iconContainer}
          >
            <Check color={styles.icon.color} size={48} />
          </MotiView>

          <View style={styles.textContainer}>
            <Text style={styles.title}>Всё готово!</Text>
            <Text style={styles.subtitle}>
              {isPoster
                ? "Вы готовы опубликовать своё первое задание и получить помощь от нашего сообщества исполнителей."
                : "Вы готовы начать зарабатывать, помогая другим выполнять их задания."}
            </Text>
          </View>

          <View style={styles.stepsContainer}>
            <Text style={styles.stepsTitle}>Следующие шаги:</Text>
            {steps.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <Text style={styles.stepNumber}>{index + 1}.</Text>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          onPress={onComplete}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>
            {isPoster ? "Опубликовать задание" : "Смотреть задания"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onBack}
          style={styles.secondaryButton}
        >
          <ArrowLeft color={styles.secondaryButtonText.color} size={20} style={styles.buttonIcon} />
          <Text style={styles.secondaryButtonText}>Назад</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
  },
  scrollView: {
    width: "100%",
    maxWidth: 400,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    gap: 32,
  },
  iconContainer: {
    backgroundColor: "#dbeafe",
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    color: "#2563eb",
  },
  textContainer: {
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    textAlign: "center",
    color: "#1f2937",
  },
  subtitle: {
    color: "#6b7280",
    fontSize: 18,
    textAlign: "center",
    lineHeight: 24,
  },
  stepsContainer: {
    backgroundColor: "#dbeafe",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    gap: 12,
  },
  stepsTitle: {
    fontWeight: "500",
    fontSize: 16,
    color: "#1f2937",
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  stepNumber: {
    color: "#2563eb",
    fontSize: 14,
    marginTop: 2,
  },
  stepText: {
    color: "#374151",
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  buttonsContainer: {
    width: "100%",
    maxWidth: 400,
    gap: 12,
    marginTop: 24,
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    height: 48,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "500",
  },
  secondaryButton: {
    height: 48,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#374151",
    fontSize: 18,
    fontWeight: "500",
  },
  buttonIcon: {
    marginRight: 6,
  },
});