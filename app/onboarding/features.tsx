import { OnboardingFeatures } from "@/components/OnboardingFeatures";
import { useRouter } from "expo-router";

export default function OnboardingFeaturesScreen() {
  const router = useRouter();
  return (
    <OnboardingFeatures
      onNext={() => router.push("/onboarding/role")}
      onBack={() => router.back()}
    />
  );
}
