// components/AutocompleteList.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';

interface AutocompleteItem {
  id: string;
  title: string;
}

interface AutocompleteListProps {
  suggestions: AutocompleteItem[];
  isLoading?: boolean;
  onItemPress: (item: AutocompleteItem) => void;
  searchQuery: string;
}

export function AutocompleteList({
  suggestions,
  isLoading,
  onItemPress,
  searchQuery,
}: AutocompleteListProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const styles = getStyles(isDark);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={isDark ? "#60a5fa" : "#2563eb"} />
          <Text allowFontScaling={false} style={styles.loadingText}>Ищем задания...</Text>
        </View>
      </View>
    );
  }

  if (suggestions.length === 0 && searchQuery.length > 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons 
            name="search-outline" 
            size={48} 
            color={isDark ? "#6b7280" : "#9ca3af"} 
          />
          <Text allowFontScaling={false} style={styles.emptyText}>Ничего не найдено</Text>
          <Text allowFontScaling={false} style={styles.emptySubtext}>
            Попробуйте изменить запрос
          </Text>
        </View>
      </View>
    );
  }

  const handleItemPress = (item: AutocompleteItem) => {
    onItemPress(item);
    // Переход на страницу поиска с query параметром
    router.push(`/(user)/tasks-search?search=${encodeURIComponent(item.title)}`);
    console.log(item)
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={suggestions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => handleItemPress(item)}
          >
            <Ionicons 
              name="search-outline" 
              size={18} 
              color={isDark ? "#9ca3af" : "#6b7280"} 
              style={styles.itemIcon}
            />
            <Text allowFontScaling={false} style={styles.itemText} numberOfLines={2}>
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    backgroundColor: isDark ? "#1f2937" : "#ffffff",
    borderTopWidth: 1,
    borderTopColor: isDark ? "#374151" : "#e5e7eb",
    maxHeight: 400,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? "#374151" : "#f3f4f6",
  },
  itemIcon: {
    marginRight: 12,
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    color: isDark ? "#f9fafb" : "#1f2937",
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 12,
    color: isDark ? "#d1d5db" : "#6b7280",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? "#f9fafb" : "#1f2937",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: isDark ? "#9ca3af" : "#6b7280",
    marginTop: 4,
    textAlign: 'center',
  },
});