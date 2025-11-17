import { OnboardingRoleSelection } from "@/components/OnboardingRoleSelection";
import { useApp } from "@/context/AppContext";
import { useRouter } from "expo-router";

export default function OnboardingRoleScreen() {
  const { setSelectedRole } = useApp();
  const router = useRouter();

  return (
    <OnboardingRoleSelection
      onSelectRole={(role) => {
        setSelectedRole(role);
        router.push("/onboarding/complete");
      }}
      onBack={() => router.back()}
    />
  );
}
