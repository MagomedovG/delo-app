// components/OnboardingWelcome.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

interface OnboardingWelcomeProps {
  onNext: () => void;
}

export function OnboardingWelcome({ onNext }: OnboardingWelcomeProps) {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.5);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={["#3B82F6", "#2563EB", "#1D4ED8"]}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.logoContainer,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={styles.logoCircle}>
          <Ionicons name="checkmark-circle" size={56} color="#2563EB" />
        </View>
        <Text allowFontScaling={false} style={styles.title}>Delo</Text>
        <Text allowFontScaling={false} style={styles.subtitle}>
          Найдите помощь или заработайте, помогая другим
        </Text>
      </Animated.View>

      <View style={styles.features}>
        <View style={styles.featureCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="people-outline" size={22} color="#fff" />
          </View>
          <Text allowFontScaling={false} style={styles.featureText}>
            Тысячи проверенных исполнителей
          </Text>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="sparkles-outline" size={22} color="#fff" />
          </View>
          <Text allowFontScaling={false} style={styles.featureText}>Безопасные сделки и оплата</Text>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark-outline" size={22} color="#fff" />
          </View>
          <Text allowFontScaling={false} style={styles.featureText}>Гарантия выполнения задач</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={onNext}>
          <Text allowFontScaling={false} style={styles.buttonText}>Начать</Text>
          <Ionicons name="arrow-forward" size={20} color="#2563EB" />
        </TouchableOpacity>
        <Text allowFontScaling={false} style={styles.note}>
          Бесплатная регистрация • Без скрытых платежей
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 100,
  },
  logoCircle: {
    backgroundColor: "#fff",
    borderRadius: 28,
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    color: "#fff",
    fontSize: 42,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#E0E7FF",
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
  },
  features: {
    gap: 12,
    marginTop: 40,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 14,
  },
  iconCircle: {
    backgroundColor: "rgba(255,255,255,0.2)",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  featureText: {
    color: "#fff",
    fontSize: 14,
  },
  footer: {
    marginBottom: 40,
    alignItems: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    height: 56,
    borderRadius: 12,
    width: width * 0.85,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 8,
  },
  buttonText: {
    color: "#2563EB",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
  },
  note: {
    color: "#E0E7FF",
    fontSize: 12,
  },
});
