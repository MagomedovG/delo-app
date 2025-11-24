import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from "@expo/vector-icons";
import { api } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { Storage } from "@/utils/storage";
import { useApp } from "@/context/AppContext";
import { useRouter } from "expo-router";
interface RegisterProps {
  onRegister: (name: string, email: string, password: string) => void;
  onGoToLogin: () => void;
}

interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string | null;
      createdAt: string;
    };
    accessToken:string;
    refreshToken: string;
  };
  errors?: Record<string, string>;
}

export function Register({ onRegister, onGoToLogin }: RegisterProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { setIsAuthenticated } = useApp()

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);
  const { login } = useAuth();

  const router = useRouter()
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Введите имя";
    } else if (name.trim().length < 2) {
      newErrors.name = "Имя должно содержать минимум 2 символа";
    }

    if (!email.trim()) {
      newErrors.email = "Введите email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Введите корректный email";
    }

    if (!password.trim()) {
      newErrors.password = "Введите пароль";
    } else if (password.length < 6) {
      newErrors.password = "Пароль должен содержать минимум 6 символов";
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Подтвердите пароль";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Пароли не совпадают";
    }

    if (!agreeToTerms) {
      newErrors.terms = "Необходимо принять условия использования";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await api.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password: password,
          confirmPassword: confirmPassword
        })
      });

      const data: RegisterResponse = await response.json();
      console.log('пользователь зарегался', data)
      if (response.ok && data.success && data.data) {
        await login(
          {
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken,
          },
          data.data.user
        );
        setIsAuthenticated(true)
        await Storage.setItem('isAuth', true)
        router.replace('/onboarding');
      } else {
        setErrors({
          submit: data.message || 'Произошла ошибка при входе',
        });
        Alert.alert('Ошибка', data.message || 'Произошла ошибка при входе');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: "Ошибка сети. Проверьте подключение к интернету." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return { text: "", color: isDark ? "#9ca3af" : "#6b7280" };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { text: "Слабый", color: "#ef4444" };
    if (strength <= 3) return { text: "Средний", color: "#f59e0b" };
    return { text: "Сильный", color: "#10b981" };
  };

  const passwordStrength = getPasswordStrength();

  const clearError = (field: string) => {
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const handleTermsPress = () => {
    Alert.alert("Условия использования", "Здесь будут условия использования приложения");
  };

  const handlePrivacyPress = () => {
    Alert.alert("Политика конфиденциальности", "Здесь будет политика конфиденциальности");
  };

  return (
    <LinearGradient
      colors={isDark ? ["#111827", "#1f2937"] : ["#eff6ff", "#ffffff"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.wrapper}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.subtitle}>
              Создайте аккаунт и начните работать
            </Text>
          </View>

          {/* Register Form */}
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <View style={styles.header}>
                <Text style={styles.title}>Регистрация</Text>
                <Text style={styles.caption}>
                  Заполните данные для создания аккаунта
                </Text>
              </View>

              {/* Submit Error */}
              {errors.submit && (
                <View style={styles.submitErrorContainer}>
                  <Text style={styles.submitErrorText}>{errors.submit}</Text>
                </View>
              )}

              {/* Name */}
              <View style={styles.field}>
                <Text style={styles.label}>
                  Имя <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.name && styles.inputError,
                  ]}
                  placeholder="Иван Иванов"
                  placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    clearError("name");
                  }}
                />
                {errors.name && (
                  <Text style={styles.errorText}>{errors.name}</Text>
                )}
              </View>

              {/* Email */}
              <View style={styles.field}>
                <Text style={styles.label}>
                  Email <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.email && styles.inputError,
                  ]}
                  placeholder="example@mail.com"
                  placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    clearError("email");
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>

              {/* Password */}
              <View style={styles.field}>
                <Text style={styles.label}>
                  Пароль <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.passwordInput,
                      errors.password && styles.inputError,
                    ]}
                    placeholder="Минимум 6 символов"
                    placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      clearError("password");
                    }}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off" : "eye"}
                      size={20}
                      color={isDark ? "#9ca3af" : "#6b7280"}
                    />
                  </TouchableOpacity>
                </View>
                {password ? (
                  <Text style={[styles.passwordStrength, { color: passwordStrength.color }]}>
                    Надёжность пароля: {passwordStrength.text}
                  </Text>
                ) : null}
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              {/* Confirm Password */}
              <View style={styles.field}>
                <Text style={styles.label}>
                  Подтвердите пароль <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.passwordInput,
                      errors.confirmPassword && styles.inputError,
                    ]}
                    placeholder="Повторите пароль"
                    placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      clearError("confirmPassword");
                    }}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={showConfirmPassword ? "eye-off" : "eye"}
                      size={20}
                      color={isDark ? "#9ca3af" : "#6b7280"}
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}
              </View>

              {/* Terms Agreement */}
              <View style={styles.field}>
                <TouchableOpacity
                  style={styles.termsContainer}
                  onPress={() => {
                    setAgreeToTerms(!agreeToTerms);
                    clearError("terms");
                  }}
                >
                  <View
                    style={[
                      styles.checkbox,
                      agreeToTerms && styles.checkboxActive,
                    ]}
                  >
                    {agreeToTerms && (
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.termsText}>
                    Я принимаю{" "}
                    <Text style={styles.link} onPress={handleTermsPress}>Условия использования</Text> и{" "}
                    <Text style={styles.link} onPress={handlePrivacyPress}>Политику конфиденциальности</Text>
                  </Text>
                </TouchableOpacity>
                {errors.terms && (
                  <Text style={styles.errorText}>{errors.terms}</Text>
                )}
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.button, isSubmitting && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                <Ionicons name="person-add-outline" size={18} color="#fff" />
                <Text style={styles.buttonText}>
                  {isSubmitting ? "Регистрация..." : "Зарегистрироваться"}
                </Text>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>или</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>
                  Уже есть аккаунт?{" "}
                </Text>
                <TouchableOpacity onPress={onGoToLogin}>
                  <Text style={styles.loginLink}>Войдите</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: { 
    flex: 1 
  },
  scrollContent: { 
    flexGrow: 1 
  },
  wrapper: { 
    flex: 1, 
    display: "flex", 
    justifyContent: 'center', 
    alignItems: 'center',  
    padding: 16 
  },
  logoContainer: { 
    alignItems: "center", 
    marginBottom: 24 
  },
  subtitle: { 
    color: isDark ? "#d1d5db" : "#6b7280", 
    textAlign: "center", 
    marginTop: 4,
    fontSize: 16
  },
  card: {
    width: "100%",
    backgroundColor: isDark ? "#1f2937" : "#fff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: isDark ? 0.2 : 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardContent: { 
    width: "100%" 
  },
  header: { 
    alignItems: "center", 
    marginBottom: 16 
  },
  title: { 
    fontSize: 24, 
    fontWeight: "700", 
    textAlign: "center",
    color: isDark ? "#f9fafb" : "#1f2937"
  },
  caption: { 
    color: isDark ? "#9ca3af" : "#6b7280", 
    textAlign: "center", 
    marginTop: 4 
  },
  field: { 
    marginBottom: 16 
  },
  label: { 
    marginBottom: 6, 
    color: isDark ? "#f9fafb" : "#374151", 
    fontWeight: "500" 
  },
  required: { 
    color: "#ef4444" 
  },
  input: {
    borderWidth: 1,
    borderColor: isDark ? "#4b5563" : "#e5e7eb",
    borderRadius: 10,
    padding: 12,
    backgroundColor: isDark ? "#374151" : "#fff",
    color: isDark ? "#f9fafb" : "#1f2937",
    fontSize: 16,
  },
  passwordContainer: { 
    position: "relative" 
  },
  passwordInput: { 
    paddingRight: 36 
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  inputError: { 
    borderColor: "#ef4444" 
  },
  errorText: { 
    color: "#ef4444", 
    fontSize: 12, 
    marginTop: 2 
  },
  passwordStrength: { 
    fontSize: 12, 
    marginTop: 2, 
    fontWeight: "500" 
  },
  termsContainer: { 
    flexDirection: "row", 
    alignItems: "flex-start",
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: isDark ? "#6b7280" : "#9ca3af",
    borderRadius: 4,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  checkboxActive: { 
    backgroundColor: "#2563eb", 
    borderColor: "#2563eb" 
  },
  termsText: { 
    flex: 1,
    fontSize: 13, 
    color: isDark ? "#d1d5db" : "#6b7280",
    lineHeight: 18,
  },
  link: { 
    color: "#2563eb" 
  },
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: { 
    color: "#fff", 
    fontWeight: "600", 
    marginLeft: 6,
    fontSize: 16
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dividerLine: { 
    flex: 1, 
    height: 1, 
    backgroundColor: isDark ? "#374151" : "#e5e7eb" 
  },
  dividerText: { 
    marginHorizontal: 8, 
    color: isDark ? "#9ca3af" : "#9ca3af", 
    fontSize: 12 
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: { 
    color: isDark ? "#9ca3af" : "#6b7280", 
    fontSize: 13 
  },
  loginLink: { 
    color: "#2563eb", 
    fontWeight: "600",
    fontSize: 13,
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
    textAlign: 'center',
  },
});