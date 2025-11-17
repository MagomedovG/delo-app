import { OnboardingWelcome } from "@/components/OnboardingWelcome";
import { useRouter } from "expo-router";

export default function OnboardingWelcomeScreen() {
  const router = useRouter();
  return <OnboardingWelcome onNext={() => router.push("/onboarding/features")} />;
}
