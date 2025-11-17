import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const [route, setRoute] = useState<null | string>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const completed = await AsyncStorage.getItem("onboardingCompleteddd");
      const token = await AsyncStorage.getItem("token");
      if (!completed) return setRoute("/onboarding");
      if (!token) return setRoute("/login");
      setRoute("/tabs");
    };
    checkAuth();
  }, []);

  if (!route) return null;
//   return <Redirect href={route} />;
  return <Redirect href={"/tabs/home"} />;
}
