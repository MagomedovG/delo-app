// app/(user)/edit-profile.tsx
import { useAuth } from "@/context/AuthContext";
import { api } from "@/utils/api";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Briefcase,
  ClipboardList,
  Mail,
  MapPin,
  Phone,
  Upload,
  User,
  Users
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

interface EditProfileData {
  name: string;
  bio: string;
  location: string;
  phone: string;
  email: string;
  role: "poster" | "tasker" | "both";
  avatar?: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "poster" | "tasker" | "both";
  avatar?: string;
  bio?: string;
  location: string;
  rating: number;
  reviewsCount: number;
  completedTasks: number;
  memberSince: string;
  createdAt: string;
  updatedAt: string;
}

interface UserResponse {
  success: boolean;
  data: UserData;
}

export default function EditProfileScreen() {
  const [formData, setFormData] = useState<EditProfileData>({
    name: "",
    bio: "",
    location: "",
    phone: "",
    email: "",
    role: "both",
    avatar: undefined,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fetchError, setFetchError] = useState<string | null>(null);

  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = getStyles(isDark);
  const { accessToken } = useAuth();

  const fetchUserData = async () => {
    if (!accessToken) {
      setFetchError("Требуется авторизация");
      setLoading(false);
      return;
    }

    try {
      const response = await api.request("/auth/me");

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }

      const data: UserResponse = await response.json();

      if (data.success) {
        setFormData({
          name: data.data.name || "",
          bio: data.data.bio || "",
          location: data.data.location || "",
          phone: data.data.phone || "",
          email: data.data.email || "",
          role: data.data.role || "both",
          avatar: data.data.avatar,
        });
      } else {
        throw new Error("Не удалось загрузить данные пользователя");
      }
    } catch (err) {
      console.error("Ошибка при загрузке данных пользователя:", err);
      setFetchError(
        err instanceof Error ? err.message : "Ошибка при загрузке данных"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleChange = (field: keyof EditProfileData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Введите имя";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Имя должно содержать минимум 2 символа";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Укажите город";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Введите номер телефона";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Введите email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Введите корректный email";
    }

    if (formData.bio.length > 500) {
      newErrors.bio = "Описание не должно превышать 500 символов";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setErrors({});

    try {
      const response = await api.request("/users/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          bio: formData.bio.trim(),
          location: formData.location.trim(),
          phone: formData.phone.trim(),
          role: formData.role,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          Alert.alert("Успех", "Профиль успешно обновлен");
          router.back();
        } else {
          setErrors({ submit: data.message || "Ошибка при сохранении" });
        }
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.message || "Ошибка сервера" });
      }
    } catch (error) {
      console.error("Ошибка при сохранении профиля:", error);
      setErrors({
        submit: "Ошибка сети. Проверьте подключение к интернету.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = () => {
    Alert.alert(
      "Загрузка фото",
      "Функция загрузки фото будет доступна после подключения к серверу"
    );
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "poster":
        return <ClipboardList size={20} color={isDark ? "#60a5fa" : "#2563eb"} />;
      case "tasker":
        return <Briefcase size={20} color={isDark ? "#60a5fa" : "#2563eb"} />;
      case "both":
        return <Users size={20} color={isDark ? "#60a5fa" : "#2563eb"} />;
      default:
        return <User size={20} color={isDark ? "#60a5fa" : "#2563eb"} />;
    }
  };

  const getRoleLabel = (role: string) => {
    return role === "poster"
      ? "Заказчик"
      : role === "tasker"
      ? "Исполнитель"
      : "Заказчик и Исполнитель";
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? "#60a5fa" : "#2563eb"} />
          <Text allowFontScaling={false} allowFontScaling={false} style={styles.loadingText}>Загрузка профиля...</Text>
        </View>
      </View>
    );
  }

  if (fetchError) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={isDark ? "#f9fafb" : "#000"} />
          </TouchableOpacity>
          <Text allowFontScaling={false} allowFontScaling={false} style={styles.headerTitle}>Редактировать профиль</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.errorContainer}>
          <Text allowFontScaling={false} allowFontScaling={false} style={styles.errorTitle}>Ошибка загрузки</Text>
          <Text allowFontScaling={false} allowFontScaling={false} style={styles.errorText}>{fetchError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchUserData}>
            <Text allowFontScaling={false} allowFontScaling={false} style={styles.retryButtonText}>Попробовать снова</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              {formData.avatar ? (
                <Image source={{ uri: formData.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarFallback}>
                  <User size={32} color={isDark ? "#60a5fa" : "#2563eb"} />
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.uploadButton} onPress={handleAvatarUpload}>
              <Upload size={16} color={isDark ? "#60a5fa" : "#2563eb"} />
              <Text allowFontScaling={false} style={styles.uploadButtonText}>Загрузить фото</Text>
            </TouchableOpacity>
            <Text allowFontScaling={false} style={styles.avatarHint}>
              Рекомендуемый размер: 400x400px{"\n"}Формат: JPG, PNG
            </Text>
          </View>

          {/* Name */}
          <View style={styles.inputGroup}>
            <Text  allowFontScaling={false} style={styles.label}>
              Имя <Text  allowFontScaling={false} style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Введите ваше имя"
              placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
              value={formData.name}
              onChangeText={(value) => handleChange("name", value)}
              editable={!saving}
            />
            {errors.name && <Text allowFontScaling={false} style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Role */}
          {/* <View style={styles.inputGroup}>
            <Text allowFontScaling={false} style={styles.label}>
              Роль на платформе <Text allowFontScaling={false} style={styles.required}>*</Text>
            </Text>
            <View style={styles.roleOptions}>
              {[
                { value: "poster", label: "Заказчик", icon: <ClipboardList size={16} /> },
                { value: "tasker", label: "Исполнитель", icon: <Briefcase size={16} /> },
                { value: "both", label: "Оба", icon: <Users size={16} /> },
              ].map((role) => (
                <TouchableOpacity
                  key={role.value}
                  style={[
                    styles.roleOption,
                    formData.role === role.value && styles.roleOptionSelected,
                  ]}
                  onPress={() => handleChange("role", role.value)}
                  disabled={saving}
                >
                  {role.icon}
                  <Text
                    style={[
                      styles.roleOptionText,
                      formData.role === role.value && styles.roleOptionTextSelected,
                    ]}
                  >
                    {role.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View> */}

          {/* Bio */}
          <View style={styles.inputGroup}>
            <Text allowFontScaling={false} style={styles.label}>О себе</Text>
            <TextInput
              style={[styles.textArea, errors.bio && styles.inputError]}
              placeholder="Расскажите о себе, своих навыках и опыте"
              placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
              value={formData.bio}
              onChangeText={(value) => handleChange("bio", value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!saving}
            />
            <Text allowFontScaling={false} style={styles.charCount}>
              {formData.bio.length}/500 символов
            </Text>
            {errors.bio && <Text allowFontScaling={false} style={styles.errorText}>{errors.bio}</Text>}
          </View>

          {/* Location */}
          <View style={styles.inputGroup}>
            <Text allowFontScaling={false} style={styles.label}>
              Город <Text allowFontScaling={false} style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWithIcon}>
              <MapPin
                size={20}
                color={isDark ? "#9ca3af" : "#6b7280"}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, styles.inputWithIconPadding, errors.location && styles.inputError]}
                placeholder="Москва"
                placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                value={formData.location}
                onChangeText={(value) => handleChange("location", value)}
                editable={!saving}
              />
            </View>
            {errors.location && (
              <Text allowFontScaling={false} style={styles.errorText}>{errors.location}</Text>
            )}
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text allowFontScaling={false} style={styles.label}>
              Телефон <Text allowFontScaling={false} style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWithIcon}>
              <Phone
                size={20}
                color={isDark ? "#9ca3af" : "#6b7280"}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, styles.inputWithIconPadding, errors.phone && styles.inputError]}
                placeholder="+7 (999) 123-45-67"
                placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                value={formData.phone}
                onChangeText={(value) => handleChange("phone", value)}
                keyboardType="phone-pad"
                editable={!saving}
              />
            </View>
            {errors.phone && <Text allowFontScaling={false} style={styles.errorText}>{errors.phone}</Text>}
            <Text allowFontScaling={false} style={styles.helperText}>
              Телефон будет виден только после принятия вашего отклика
            </Text>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text allowFontScaling={false} style={styles.label}>
              Email <Text allowFontScaling={false} style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWithIcon}>
              <Mail
                size={20}
                color={isDark ? "#9ca3af" : "#6b7280"}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, styles.inputWithIconPadding, errors.email && styles.inputError]}
                placeholder="email@example.com"
                placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                value={formData.email}
                onChangeText={(value) => handleChange("email", value)}
                keyboardType="email-address"
                editable={false} // Email обычно нельзя менять
              />
            </View>
            {errors.email && <Text allowFontScaling={false} style={styles.errorText}>{errors.email}</Text>}
            <Text allowFontScaling={false} style={styles.helperText}>Email нельзя изменить</Text>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text allowFontScaling={false} style={styles.infoCardTitle}>ℹ️ Конфиденциальность</Text>
            <View style={styles.infoList}>
              <Text allowFontScaling={false} style={styles.infoItem}>
                • Ваш телефон и email не публикуются в профиле
              </Text>
              <Text allowFontScaling={false} style={styles.infoItem}>
                • Контакты становятся доступны только принятым исполнителям
              </Text>
              <Text allowFontScaling={false} style={styles.infoItem}>
                • Вы можете изменить настройки приватности в любое время
              </Text>
            </View>
          </View>

          {/* Submit Error */}
          {errors.submit && (
            <View style={styles.submitErrorContainer}>
              <Text allowFontScaling={false} style={styles.submitErrorText}>{errors.submit}</Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => router.back()}
              disabled={saving}
            >
              <Text allowFontScaling={false} style={styles.cancelButtonText}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton, saving && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  {/* <Save size={20} color="white" /> */}
                  <Text allowFontScaling={false} style={styles.submitButtonText}>Сохранить</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#111827" : "#f9fafb",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
      color: isDark ? "#d1d5db" : "#6b7280",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: isDark ? "#1f2937" : "#fff",
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "#374151" : "#e5e7eb",
    },
    backButton: {
      padding: 4,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: isDark ? "#f9fafb" : "#1f2937",
    },
    headerSpacer: {
      width: 32,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    errorTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: isDark ? "#f9fafb" : "#1f2937",
      marginBottom: 8,
    },
    errorText: {
      fontSize: 14,
      color: isDark ? "#9ca3af" : "#6b7280",
      textAlign: "center",
      marginBottom: 16,
    },
    retryButton: {
      backgroundColor: isDark ? "#2563eb" : "#2563eb",
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
    },
    retryButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
    },
    scrollView: {
      flex: 1,
    },
    card: {
      backgroundColor: isDark ? "#1f2937" : "#fff",
      margin: 16,
      padding: 20,
      borderRadius: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.1 : 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    avatarSection: {
      alignItems: "center",
      marginBottom: 24,
    },
    avatarContainer: {
      marginBottom: 12,
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
    },
    avatarFallback: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: isDark ? "#1e40af" : "#dbeafe",
      alignItems: "center",
      justifyContent: "center",
    },
    uploadButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDark ? "#4b5563" : "#d1d5db",
      marginBottom: 8,
    },
    uploadButtonText: {
      fontSize: 14,
      color: isDark ? "#60a5fa" : "#2563eb",
      fontWeight: "500",
    },
    avatarHint: {
      fontSize: 12,
      color: isDark ? "#9ca3af" : "#6b7280",
      textAlign: "center",
      lineHeight: 16,
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      color: isDark ? "#f9fafb" : "#374151",
      marginBottom: 8,
    },
    required: {
      color: "#ef4444",
    },
    input: {
      borderWidth: 1,
      borderColor: isDark ? "#4b5563" : "#d1d5db",
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
      backgroundColor: isDark ? "#374151" : "white",
      color: isDark ? "#f9fafb" : "#1f2937",
    },
    inputError: {
      borderColor: "#ef4444",
    },
    errorText: {
      color: "#ef4444",
      fontSize: 14,
      marginTop: 4,
    },
    textArea: {
      borderWidth: 1,
      borderColor: isDark ? "#4b5563" : "#d1d5db",
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
      minHeight: 100,
      textAlignVertical: "top",
      backgroundColor: isDark ? "#374151" : "white",
      color: isDark ? "#f9fafb" : "#1f2937",
    },
    charCount: {
      fontSize: 12,
      color: isDark ? "#9ca3af" : "#6b7280",
      marginTop: 4,
      textAlign: "right",
    },
    inputWithIcon: {
      position: "relative",
    },
    inputIcon: {
      position: "absolute",
      left: 12,
      top: 12,
      zIndex: 1,
    },
    inputWithIconPadding: {
      paddingLeft: 40,
    },
    helperText: {
      fontSize: 12,
      color: isDark ? "#9ca3af" : "#6b7280",
      marginTop: 4,
    },
    roleOptions: {
      flexDirection: "row",
      gap: 8,
    },
    roleOption: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDark ? "#4b5563" : "#d1d5db",
      backgroundColor: isDark ? "#374151" : "white",
    },
    roleOptionSelected: {
      borderColor: isDark ? "#60a5fa" : "#2563eb",
      backgroundColor: isDark ? "#1e40af" : "#eff6ff",
    },
    roleOptionText: {
      fontSize: 14,
      color: isDark ? "#d1d5db" : "#374151",
      fontWeight: "500",
    },
    roleOptionTextSelected: {
      color: isDark ? "#60a5fa" : "#2563eb",
    },
    infoCard: {
      backgroundColor: isDark ? "#1e3a8a" : "#eff6ff",
      borderWidth: 1,
      borderColor: isDark ? "#3730a3" : "#dbeafe",
      borderRadius: 8,
      padding: 16,
      marginBottom: 20,
    },
    infoCardTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: isDark ? "#dbeafe" : "#1e40af",
      marginBottom: 8,
    },
    infoList: {
      gap: 4,
    },
    infoItem: {
      fontSize: 13,
      color: isDark ? "#e5e7eb" : "#374151",
      lineHeight: 18,
    },
    submitErrorContainer: {
      backgroundColor: isDark ? "#7f1d1d" : "#fef2f2",
      borderWidth: 1,
      borderColor: isDark ? "#991b1b" : "#fecaca",
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    submitErrorText: {
      color: isDark ? "#fca5a5" : "#dc2626",
      fontSize: 14,
      textAlign: "center",
    },
    actions: {
      flexDirection: "row",
      gap: 12,
    },
    button: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
    },
    cancelButton: {
      backgroundColor: isDark ? "#374151" : "#f3f4f6",
      borderWidth: 1,
      borderColor: isDark ? "#4b5563" : "#d1d5db",
    },
    cancelButtonText: {
      color: isDark ? "#f9fafb" : "#374151",
      fontSize: 16,
      fontWeight: "600",
    },
    submitButton: {
      backgroundColor: "#2563eb",
    },
    submitButtonDisabled: {
      opacity: 0.6,
    },
    submitButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
    },
  });