import React, { useEffect, useLayoutEffect, useState } from "react";
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
import { useNavigation, useRouter } from "expo-router";
import { Storage } from "@/utils/storage";
import { api } from "@/utils/api";
import { useApp } from "@/context/AppContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      avatar: string;
      rating: number;
      reviewsCount: number;
      completedTasks: number;
      hasCompletedOnboarding: boolean;
    };
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export function Login({ onGoToRegister }: { onGoToRegister: () => void }) {
  const [email, setEmail] = useState('mgmdvgg@mail.ru');
  const [password, setPassword] = useState('gamzatgamzat');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const { setIsAuthenticated } = useApp()
  const { login } = useAuth();
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets()

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = "Введите email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Введите корректный email";
    if (!password.trim()) newErrors.password = "Введите пароль";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});
    console.log('data')

    try {
      const response = await api.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          rememberMe,
        }),
      });

      const data: LoginResponse = await response.json();
      console.log(data)
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
        // Сохраняем rememberMe настройку
        if (rememberMe) {
          await Storage.setItem('rememberMe', true);
        }

        if (data.data.user.hasCompletedOnboarding) {
          router.replace('/(user)/tabs/home');
        } else {
          router.replace('/onboarding');
        }
      } else {
        setErrors({
          submit: data.message || 'Произошла ошибка при входе',
        });
        Alert.alert('Ошибка', data.message || 'Произошла ошибка при входе');
      }
    } catch (error) {
      console.error('Ошибка при входе:', error);
      setErrors({
        submit: 'Ошибка сети. Проверьте подключение к интернету.',
      });
      Alert.alert('Ошибка', 'Ошибка сети. Проверьте подключение к интернету.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <LinearGradient
      colors={isDark ? ["#111827", "#1f2937"] : ["#eff6ff", "#ffffff"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
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
          contentContainerStyle={{  justifyContent: "flex-start" }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.wrapper}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              {/* <Image style={{ height:150,aspectRatio:1}} resizeMode="contain" source={require('../assets/icons/logo.png')}/> */}
            </View>

            {/* Card */}
            <View style={styles.card}>
              {/* <Text style={styles.title}>Вход</Text> */}

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
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                {errors.email ? (
                  <Text style={styles.errorText}>{errors.email}</Text>
                ) : null}
              </View>

              {/* Password */}
              <View style={styles.field}>
                <Text style={styles.label}>Пароль</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.passwordInput,
                      errors.password ? styles.inputError : undefined,
                    ]}
                    placeholder="Введите пароль"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={(t) => {
                      setPassword(t);
                      if (errors.password) setErrors({ ...errors, password: "" });
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
                {errors.password ? (
                  <Text style={styles.errorText}>{errors.password}</Text>
                ) : null}
              </View>

              {/* Remember Me + Forgot Password */}
              <View style={styles.rowBetween}>
                <TouchableOpacity
                  style={styles.rememberMe}
                  onPress={() => setRememberMe((r) => !r)}
                  disabled={isLoading}
                >
                  {/* <View
                    style={[
                      styles.checkbox,
                      rememberMe && styles.checkboxActive,
                    ]}
                  />
                  <Text style={styles.rememberText}>Запомнить меня</Text> */}
                </TouchableOpacity>

                <TouchableOpacity disabled={isLoading}>
                  <Text style={styles.link}>Забыли пароль?</Text>
                </TouchableOpacity>
              </View>

              {/* Submit Error */}
              {errors.submit && (
                <Text style={styles.submitError}>{errors.submit}</Text>
              )}

              {/* Button */}
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
                    <Ionicons name="log-in-outline" size={18} color="#fff" />
                    <Text style={styles.buttonText}>Войти</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>или</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Register */}
              <TouchableOpacity 
                onPress={onGoToRegister}
                disabled={isLoading}
              >
                <Text style={styles.registerText}>
                  Нет аккаунта?{" "}
                  <Text style={styles.registerLink}>Зарегистрируйтесь</Text>
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <Text style={styles.footer}>
              Нажимая "Войти", вы принимаете наши{" "}
              <Text style={styles.link}>Условия использования</Text> и{" "}
              <Text style={styles.link}>Политику конфиденциальности</Text>
            </Text>
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
    marginBottom: 24 
  },
  logoText: { 
    fontSize: 40, 
    color: isDark ? "#60a5fa" : "#2563eb", 
    fontWeight: "700" 
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
  title: { 
    fontSize: 24, 
    fontWeight: "700", 
    textAlign: "center",
    color: isDark ? "#f9fafb" : "#1f2937"
  },
  caption: { 
    color: isDark ? "#9ca3af" : "#6b7280", 
    textAlign: "center", 
    marginBottom: 16 
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
  submitError: {
    color: "#ef4444", 
    fontSize: 14, 
    textAlign: "center",
    marginBottom: 12,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  rememberMe: { 
    flexDirection: "row", 
    alignItems: "center" 
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: isDark ? "#6b7280" : "#9ca3af",
    borderRadius: 4,
    marginRight: 8,
  },
  checkboxActive: { 
    backgroundColor: "#2563eb", 
    borderColor: "#2563eb" 
  },
  rememberText: { 
    fontSize: 13, 
    color: isDark ? "#d1d5db" : "#6b7280" 
  },
  link: { 
    color: "#2563eb", 
    fontSize: 13 
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