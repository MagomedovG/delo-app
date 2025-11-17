import { OnboardingComplete } from "@/components/OnboardingComplete";
import { useApp } from "@/context/AppContext";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
export default function OnboardingCompleteScreen() {
  const { selectedRole } = useApp();
  const router = useRouter();
  const handleComplete = async () => {
    await AsyncStorage.setItem("onboardingCompleted", "true");
    router.replace("/login");
  };
  return (
    <OnboardingComplete
      role={selectedRole}
      onComplete={handleComplete}
      onBack={() => router.back()}
    />
  );
}
