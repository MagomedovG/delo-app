import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// Компонент хедера для главной страницы
export default function HomeHeader() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter()
  return (
    <View style={[headerStyles.homeHeader, { paddingTop: insets.top }, isDark ? {backgroundColor:"#111827"} : {backgroundColor:"#f9fafb"}]}>
      <Text allowFontScaling={false} style={headerStyles.logo}>Delo</Text>
      <View style={headerStyles.headerButtons}>
      <TouchableOpacity style={headerStyles.ghostButton} onPress={() => router.push('/(user)/tasks-search')}>
          <MaterialIcons name="tune" size={18} color={isDark ? "#60a5fa" : "#1D4ED8"} />
          <Text allowFontScaling={false} style={headerStyles.ghostText}>Фильтры</Text>
        </TouchableOpacity>
        <TouchableOpacity style={headerStyles.outlineButton} onPress={() => console.log("Отклики")}>
          <Text allowFontScaling={false} style={headerStyles.outlineText}>Отклики</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity style={headerStyles.ghostButton} onPress={() => console.log("Профиль")}>
          <Ionicons name="person-outline" size={18} color="#2563eb" />
          <Text allowFontScaling={false} style={headerStyles.ghostText}>Профиль</Text>
        </TouchableOpacity> */}
      </View>
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
  