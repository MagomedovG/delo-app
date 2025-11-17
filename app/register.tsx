import React from "react";
import { Login } from "@/components/Login";
import { useRouter } from "expo-router";
import { useApp } from "@/context/AppContext";
import { Register } from "@/components/Register";

export default function RegisterScreen() {
    const router = useRouter();
    const { setIsAuthenticated } = useApp();
  
    const handleRegister = (name: string, email: string, password: string) => {
      console.log("Register:", { name, email, password });
      setIsAuthenticated(true);
      router.push("/onboarding");
    };
  
    return (
      <Register
        onRegister={handleRegister}
        onGoToLogin={() => router.push("/login")}
      />
    );
  }
  
