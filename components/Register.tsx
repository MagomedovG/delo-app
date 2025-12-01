import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  useColorScheme,
  Image
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { Storage } from "@/utils/storage";
import { api } from "@/utils/api";
import { useApp } from "@/context/AppContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
    accessToken: string;
    refreshToken: string;
  };
  errors?: Record<string, string>;
}

interface RegisterProps {
  onGoToLogin: () => void;
}

export function Register({ onGoToLogin }: RegisterProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { setIsAuthenticated } = useApp();
  const { login } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Введите имя";
    else if (name.trim().length < 2) newErrors.name = "Имя должно содержать минимум 2 символа";

    if (!email.trim()) newErrors.email = "Введите email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Введите корректный email";

    if (!password.trim()) newErrors.password = "Введите пароль";
    else if (password.length < 6) newErrors.password = "Пароль должен содержать минимум 6 символов";

    if (!confirmPassword.trim()) newErrors.confirmPassword = "Подтвердите пароль";
    else if (password !== confirmPassword) newErrors.confirmPassword = "Пароли не совпадают";

    if (!agreeToTerms) newErrors.terms = "Необходимо принять условия использования";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
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
      console.log('пользователь зарегался', data);
      
      if (response.ok && data.success && data.data) {
        await login(
          {
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken,
          },
          data.data.user
        );
        setIsAuthenticated(true);
        await Storage.setItem('isAuth', true);
        router.replace('/onboarding');
      } else {
        setErrors({
          submit: data.message || 'Произошла ошибка при регистрации',
        });
        Alert.alert('Ошибка', data.message || 'Произошла ошибка при регистрации');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: "Ошибка сети. Проверьте подключение к интернету." });
      Alert.alert('Ошибка', 'Ошибка сети. Проверьте подключение к интернету.');
    } finally {
      setIsLoading(false);
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

  return (
    <LinearGradient
      colors={isDark ? ["#111827", "#1f2937"] : ["#eff6ff", "#ffffff"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Логотип в хедере */}
      <View style={{display:'flex', flexDirection:'row', alignItems:'center',justifyContent:'center', marginTop:insets.top}}>
        <Image style={{ height:30,width:40}} resizeMode="contain" source={require("../assets/icons/logo.png")}/>
        <Image style={{ height:30,width:60}} resizeMode="contain" source={require("../assets/icons/string-logo.png")}/>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ justifyContent: "flex-start" }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.wrapper}>
            {/* Логотип в контенте (скрыт, так как уже в хедере) */}
            <View style={styles.logoContainer}>
              <Text style={styles.subtitle}>
                Создайте аккаунт и начните работать
              </Text>
            </View>

            {/* Карточка с формой */}
            <View style={styles.card}>
              {/* Имя */}
              <View style={styles.field}>
                <Text style={styles.label}>Имя</Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.name ? styles.inputError : undefined,
                  ]}
                  placeholder="Иван Иванов"
                  value={name}
                  onChangeText={(t) => {
                    setName(t);
                    clearError("name");
                  }}
                  editable={!isLoading}
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              {/* Email */}
              <View style={styles.field}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.email ? styles.inputError : undefined,
                  ]}
                  placeholder="example@mail.com"
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    clearError("email");
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              {/* Пароль */}
              <View style={styles.field}>
                <Text style={styles.label}>Пароль</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.passwordInput,
                      errors.password ? styles.inputError : undefined,
                    ]}
                    placeholder="Минимум 6 символов"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={(t) => {
                      setPassword(t);
                      clearError("password");
                    }}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword((p) => !p)}
                    disabled={isLoading}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off" : "eye"}
                      size={20}
                      color="#6b7280"
                    />
                  </TouchableOpacity>
                </View>
                {password ? (
                  <Text style={[styles.passwordStrength, { color: passwordStrength.color }]}>
                    Надёжность пароля: {passwordStrength.text}
                  </Text>
                ) : null}
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>

              {/* Подтверждение пароля */}
              <View style={styles.field}>
                <Text style={styles.label}>Подтвердите пароль</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.passwordInput,
                      errors.confirmPassword ? styles.inputError : undefined,
                    ]}
                    placeholder="Повторите пароль"
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={(t) => {
                      setConfirmPassword(t);
                      clearError("confirmPassword");
                    }}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword((p) => !p)}
                    disabled={isLoading}
                  >
                    <Ionicons
                      name={showConfirmPassword ? "eye-off" : "eye"}
                      size={20}
                      color="#6b7280"
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
              </View>

              {/* Соглашение с условиями */}
              <TouchableOpacity
                style={styles.termsContainer}
                onPress={() => {
                  setAgreeToTerms(!agreeToTerms);
                  clearError("terms");
                }}
                disabled={isLoading}
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
                  <Text style={styles.link}>Условия использования</Text> и{" "}
                  <Text style={styles.link}>Политику конфиденциальности</Text>
                </Text>
              </TouchableOpacity>
              {errors.terms && <Text style={[styles.errorText, {marginBottom:8, textAlign:'center'}]}>{errors.terms}</Text>}

              {/* Ошибка формы */}
              {errors.submit && (
                <Text style={styles.submitError}>{errors.submit}</Text>
              )}

              {/* Кнопка регистрации */}
              <TouchableOpacity 
                style={[
                  styles.button,
                  isLoading && styles.buttonDisabled
                ]} 
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="person-add-outline" size={18} color="#fff" />
                    <Text style={styles.buttonText}>Зарегистрироваться</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Разделитель */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>или</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Ссылка на вход */}
              <TouchableOpacity 
                onPress={onGoToLogin}
                disabled={isLoading}
              >
                <Text style={styles.registerText}>
                  Уже есть аккаунт?{" "}
                  <Text style={styles.registerLink}>Войдите</Text>
                </Text>
              </TouchableOpacity>
            </View>

            {/* Футер */}
            {/* <Text style={styles.footer}>
              Нажимая "Зарегистрироваться", вы принимаете наши{" "}
              <Text style={styles.link}>Условия использования</Text> и{" "}
              <Text style={styles.link}>Политику конфиденциальности</Text>
            </Text> */}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: { 
    flex: 1 
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
    marginBottom: 5 
  },
  subtitle: { 
    color: isDark ? "#d1d5db" : "#6b7280", 
    textAlign: "center", 
    marginTop: 4,
    fontSize: 14,
  },
  card: {
    width: "100%",
    // backgroundColor: isDark ? "#1f2937" : "#fff",
    // borderRadius: 16,
    padding: 24,
    // shadowColor: "#000",
    // shadowOpacity: isDark ? 0.2 : 0.08,
    // shadowRadius: 8,
    // elevation: 2,
  },
  field: { 
    marginBottom: 12 
  },
  label: { 
    marginBottom: 6, 
    color: isDark ? "#f9fafb" : "#374151", 
    fontWeight: "500" 
  },
  input: {
    borderWidth: 1,
    borderColor: isDark ? "#4b5563" : "#e5e7eb",
    borderRadius: 10,
    paddingVertical:10,
    paddingHorizontal: 12,
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
    marginBottom: 16,
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
  submitError: {
    color: "#ef4444", 
    fontSize: 14, 
    textAlign: "center",
    marginBottom: 12,
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
    opacity: 0.7,
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
  registerText: { 
    textAlign: "center", 
    color: isDark ? "#d1d5db" : "#6b7280",
    fontSize: 14
  },
  registerLink: { 
    color: "#2563eb", 
    fontWeight: "600" 
  },
  footer: {
    marginTop: 24,
    textAlign: "center",
    color: isDark ? "#9ca3af" : "#9ca3af",
    fontSize: 12,
    lineHeight: 18,
  },
});