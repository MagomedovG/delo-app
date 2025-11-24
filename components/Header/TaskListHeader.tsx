import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from 'react-native';

export default function TaskListHeader() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const styles = getStyles(isDark);
  
    return (
      <View style={[styles.taskListHeader, { paddingTop: insets.top }]}>
        <View style={{ marginLeft: 8 }}>
          <Text style={styles.title}>Мои задания</Text>
          <Text style={styles.subtitle}>25 заданий</Text>
        </View>
      </View>
    );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
    homeHeader: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "center" as const,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: isDark ? "#1f2937" : "#fff",
    },
    logo: {
      fontSize: 26,
      color: isDark ? "#60a5fa" : "#2563eb",
      fontWeight: "700" as const,
    },
    headerButtons: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: 8,
    },
    outlineButton: {
      borderWidth: 1,
      borderColor: isDark ? "#60a5fa" : "#2563eb",
      borderRadius: 8,
      paddingVertical: 6,
      paddingHorizontal: 10,
    },
    outlineText: {
      color: isDark ? "#60a5fa" : "#2563eb",
      fontWeight: "500" as const,
    },
    ghostButton: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: 4,
      padding: 6,
    },
    ghostText: {
      color: isDark ? "#60a5fa" : "#2563eb",
      fontWeight: "500" as const,
    },
  
    taskListHeader: { 
      flexDirection: "row" as const, 
      alignItems: "center" as const, 
      padding: 16, 
      borderBottomWidth: 1, 
      borderColor: isDark ? "#374151" : "#E5E7EB", 
      backgroundColor: isDark ? "#1f2937" : "#fff" 
    },
    backBtn: { padding: 6 },
    title: { 
      fontSize: 18, 
      fontWeight: "600" as const,
      color: isDark ? "#f9fafb" : "#1f2937"
    },
    subtitle: { 
      color: isDark ? "#9ca3af" : "#6B7280", 
      fontSize: 12 
    },
    filterBtn: { 
      marginLeft: "auto", 
      backgroundColor: isDark ? "#1e40af" : "#EFF6FF", 
      paddingHorizontal: 12, 
      paddingVertical: 6, 
      borderRadius: 8, 
      flexDirection: "row" as const, 
      alignItems: "center" as const 
    },
    filterText: { 
      marginLeft: 6, 
      color: isDark ? "#93c5fd" : "#1D4ED8", 
      fontSize: 12 
    },
});