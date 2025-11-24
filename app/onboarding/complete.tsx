import { OnboardingComplete } from "@/components/OnboardingComplete";
import { useApp } from "@/context/AppContext";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/utils/api";
export default function OnboardingCompleteScreen() {
  // const { selectedRole } = useApp();
  const router = useRouter();

  const completeOnboarding = async () => {
    try{
      await api.request('/auth/complete-onboarding', {
        method: 'POST',
      });
      await AsyncStorage.setItem("onboardingCompleted", 'true')
      console.log('onboarding completed')
    } catch {
      console.log('onboarding didnt complete')
    }
      
  };

  const handleComplete = async () => {
    completeOnboarding()
    router.replace("/(user)/tabs/home");
  };
  return (
    <OnboardingComplete
      onComplete={handleComplete}
      onBack={() => router.back()}
    />
  );
}
