import React from "react";
import { Login } from "@/components/Login";
import { useRouter } from "expo-router";
import { useApp } from "@/context/AppContext";

export default function LoginScreen() {
  const router = useRouter();
  const { setIsAuthenticated } = useApp();

  const handleLogin = (email: string, password: string) => {
    console.log("Login attempt:", { email, password });
    setIsAuthenticated(true);
    router.push("/tabs/home");
  };

  return <Login onLogin={handleLogin} onGoToRegister={() => router.push("/(auth)/register")} />;
}
