// context/AppContext.tsx
import React, { createContext, useContext, useState } from "react";

type UserRole = "poster" | "tasker" | null;
type Category = { id: string; name: string } | null;

interface AppContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (v: boolean) => void;
  selectedRole: UserRole;
  setSelectedRole: (r: UserRole) => void;
  selectedCategory: Category;
  setSelectedCategory: (c: Category) => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  currentUserId: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const currentUserId = "user1"; // мок — позже заменим реальным

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        selectedRole,
        setSelectedRole,
        selectedCategory,
        setSelectedCategory,
        selectedTaskId,
        setSelectedTaskId,
        currentUserId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
};
