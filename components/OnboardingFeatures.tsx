import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ArrowRight, ArrowLeft, CheckCircle, Users, Shield, DollarSign } from "lucide-react-native";
import { MotiView, MotiText } from "moti";

interface OnboardingFeaturesProps {
  onNext: () => void;
  onBack: () => void;
}

const features = [
  {
    icon: CheckCircle,
    title: "Публикуйте задания",
    description:
      "От ремонта до виртуальной помощи – опубликуйте любое задание и установите свой бюджет.",
  },
  {
    icon: Users,
    title: "Найдите исполнителей",
    description:
      "Просматривайте предложения от проверенных исполнителей, читайте отзывы и выбирайте лучшего.",
  },
  {
    icon: DollarSign,
    title: "Безопасные платежи",
    description:
      "Платите безопасно через нашу платформу. Деньги переводятся только после выполнения работы.",
  },
  {
    icon: Shield,
    title: "Доверие и безопасность",
    description:
      "Все исполнители проверены. Читайте отзывы, проверяйте рейтинги и общайтесь безопасно.",
  },
];

export function OnboardingFeatures({ onNext, onBack }: OnboardingFeaturesProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const feature = features[currentSlide];
  const Icon = feature.icon;

  const handleNext = () => {
    if (currentSlide < features.length - 1) setCurrentSlide((p) => p + 1);
    else onNext();
  };

  const handlePrev = () => {
    if (currentSlide > 0) setCurrentSlide((p) => p - 1);
    else onBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <MotiView
          key={currentSlide}
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400 }}
          style={styles.slideContainer}
        >
          <View style={styles.iconContainer}>
            <Icon color={styles.icon.color} size={48} />
          </View>

          <MotiText
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 200 }}
            style={styles.title}
          >
            {feature.title}
          </MotiText>

          <Text style={styles.description}>
            {feature.description}
          </Text>

          {/* Dots */}
          <View style={styles.dotsContainer}>
            {features.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentSlide ? styles.activeDot : styles.inactiveDot
                ]}
              />
            ))}
          </View>
        </MotiView>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          onPress={handleNext}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>
            {currentSlide < features.length - 1 ? "Далее" : "Продолжить"}
          </Text>
          <ArrowRight color="white" size={20} style={styles.buttonIcon} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handlePrev}
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
  content: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
    maxWidth: 400,
  },
  slideContainer: {
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
  title: {
    fontSize: 28,
    fontWeight: "600",
    textAlign: "center",
    color: "#1f2937",
  },
  description: {
    color: "#6b7280",
    fontSize: 18,
    textAlign: "center",
    lineHeight: 28,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingTop: 16,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 32,
    backgroundColor: "#2563eb",
  },
  inactiveDot: {
    width: 8,
    backgroundColor: "#d1d5db",
  },
  buttonsContainer: {
    width: "100%",
    maxWidth: 400,
    gap: 12,
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
    marginLeft: 6,
    marginRight: 6,
  },
});