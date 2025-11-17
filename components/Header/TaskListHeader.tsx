import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
export default function TaskListHeader() {
    const insets = useSafeAreaInsets();
  
    return (
      <View style={[headerStyles.taskListHeader, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => console.log("Назад")} style={headerStyles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="black" />
        </TouchableOpacity>
  
        <View style={{ marginLeft: 8 }}>
          <Text style={headerStyles.title}>Все задания</Text>
          <Text style={headerStyles.subtitle}>25 заданий</Text>
        </View>
  
        <TouchableOpacity style={headerStyles.filterBtn} onPress={() => console.log("Фильтры")}>
          <MaterialIcons name="tune" size={18} color="#1D4ED8" />
          <Text style={headerStyles.filterText}>Фильтры</Text>
        </TouchableOpacity>
      </View>
    );
  }
  const headerStyles = StyleSheet.create({
    // Стили для HomeHeader
    homeHeader: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "center" as const,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: "#fff",
    },
    logo: {
      fontSize: 26,
      color: "#2563eb",
      fontWeight: "700" as const,
    },
    headerButtons: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: 8,
    },
    outlineButton: {
      borderWidth: 1,
      borderColor: "#2563eb",
      borderRadius: 8,
      paddingVertical: 6,
      paddingHorizontal: 10,
    },
    outlineText: {
      color: "#2563eb",
      fontWeight: "500" as const,
    },
    ghostButton: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: 4,
      padding: 6,
    },
    ghostText: {
      color: "#2563eb",
      fontWeight: "500" as const,
    },
  
    // Стили для TaskListHeader
    taskListHeader: { 
      flexDirection: "row" as const, 
      alignItems: "center" as const, 
      padding: 16, 
      borderBottomWidth: 1, 
      borderColor: "#E5E7EB", 
      backgroundColor: "#fff" 
    },
    backBtn: { padding: 6 },
    title: { fontSize: 18, fontWeight: "600" as const },
    subtitle: { color: "#6B7280", fontSize: 12 },
    filterBtn: { 
      marginLeft: "auto", 
      backgroundColor: "#EFF6FF", 
      paddingHorizontal: 12, 
      paddingVertical: 6, 
      borderRadius: 8, 
      flexDirection: "row" as const, 
      alignItems: "center" as const 
    },
    filterText: { marginLeft: 6, color: "#1D4ED8", fontSize: 12 },
  })
  