import React, { useState } from "react";
import { View, StyleSheet, TextInput, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useAppStore } from "@/store";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const login = useAppStore((state) => state.login);
  const isLoading = useAppStore((state) => state.isLoading);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    setError("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await login(email.trim(), password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(err.message || "فشل في تسجيل الدخول");
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={{
          paddingTop: Spacing.xl,
          paddingHorizontal: Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
          flexGrow: 1,
        }}
      >
        <View style={styles.header}>
          <ThemedText type="hero">مرحباً بعودتك</ThemedText>
          <ThemedText type="body" style={{ color: theme.textMuted, marginTop: Spacing.sm }}>
            سجل دخولك للاستمرار في التسوق
          </ThemedText>
        </View>

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: theme.error + "20" }]}>
            <Feather name="alert-circle" size={16} color={theme.error} />
            <ThemedText type="caption" style={{ color: theme.error, marginLeft: Spacing.sm }}>
              {error}
            </ThemedText>
          </View>
        ) : null}

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <ThemedText type="caption" style={styles.label}>
              البريد الإلكتروني
            </ThemedText>
            <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
              <Feather name="mail" size={20} color={theme.textMuted} />
              <TextInput
                placeholder="أدخل بريدك الإلكتروني"
                placeholderTextColor={theme.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[styles.input, { color: theme.text, textAlign: "right" }]}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="caption" style={styles.label}>
              كلمة المرور
            </ThemedText>
            <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
              <Feather name="lock" size={20} color={theme.textMuted} />
              <TextInput
                placeholder="أدخل كلمة المرور"
                placeholderTextColor={theme.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={[styles.input, { color: theme.text, textAlign: "right" }]}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={theme.textMuted}
                />
              </Pressable>
            </View>
          </View>

          <Pressable style={styles.forgotPassword}>
            <ThemedText type="link">نسيت كلمة المرور؟</ThemedText>
          </Pressable>

          <Button onPress={handleLogin} disabled={isLoading} style={styles.loginButton}>
            {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
          </Button>
        </View>

        <View style={styles.footer}>
          <ThemedText type="body" style={{ color: theme.textMuted }}>
            ليس لديك حساب؟{" "}
          </ThemedText>
          <Pressable onPress={() => navigation.replace("Register")}>
            <ThemedText type="link">إنشاء حساب</ThemedText>
          </Pressable>
        </View>
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: Spacing["3xl"],
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: Spacing.xl,
  },
  loginButton: {
    marginTop: Spacing.md,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
});
