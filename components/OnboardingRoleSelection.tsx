import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

interface OnboardingRoleSelectionProps {
  onSelectRole: (role: "poster" | "tasker") => void;
  onBack: () => void;
}

export const OnboardingRoleSelection: React.FC<OnboardingRoleSelectionProps> = ({
  onSelectRole,
  onBack,
}) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Как вы хотите начать?</Text>
        <Text style={styles.subtitle}>
          Вы всегда можете переключаться между публикацией и выполнением заданий
        </Text>

        {/* Публиковать задания */}
        <TouchableOpacity
          style={[styles.card, styles.cardShadow]}
          onPress={() => onSelectRole("poster")}
          activeOpacity={0.9}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="briefcase-outline" size={28} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Публиковать задания</Text>
              <Text style={styles.cardSubtitle}>Мне нужна помощь</Text>
            </View>
          </View>

          <View style={styles.list}>
            <Text style={styles.listItem}>✓ Опишите, что нужно сделать</Text>
            <Text style={styles.listItem}>✓ Получайте предложения от исполнителей</Text>
            <Text style={styles.listItem}>✓ Выберите, кого вы хотите нанять</Text>
          </View>
        </TouchableOpacity>

        {/* Стать исполнителем */}
        <TouchableOpacity
          style={[styles.card, styles.cardShadow]}
          onPress={() => onSelectRole("tasker")}
          activeOpacity={0.9}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="hammer-wrench" size={28} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Стать исполнителем</Text>
              <Text style={styles.cardSubtitle}>Я хочу зарабатывать</Text>
            </View>
          </View>

          <View style={styles.list}>
            <Text style={styles.listItem}>✓ Просматривайте доступные задания</Text>
            <Text style={styles.listItem}>✓ Делайте предложения на задания</Text>
            <Text style={styles.listItem}>✓ Получайте оплату за выполненную работу</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Назад */}
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={20} color="#2563EB" />
        <Text style={styles.backText}>Назад</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    padding: 24,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    gap: 24,
    marginTop: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "600",
    textAlign: "center",
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 15,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  cardShadow: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    backgroundColor: "#EFF6FF",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  cardSubtitle: {
    color: "#6B7280",
    fontSize: 14,
  },
  list: {
    marginTop: 8,
    gap: 4,
  },
  listItem: {
    color: "#4B5563",
    fontSize: 14,
  },
  backButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    marginTop: 24,
  },
  backText: {
    color: "#2563EB",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
});
