"use client";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import type { RootStackParamList } from "../../navigation/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { signInWithEmailAndPassword } from "firebase/auth";

import { auth } from "../../firebase";
import Toast from "react-native-toast-message"; // ✅ Toast para notificaciones

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function Login({ route, navigation }: Props) {
  const [fontsLoaded] = useFonts({
    Poppins: require("../../../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Bold": require("../../../assets/fonts/Poppins-Bold.ttf"),
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { google } = route.params || {};

  if (!fontsLoaded) return null;

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Campos incompletos",
        text2: "⚠️ Por favor completa todos los campos.",
        position: "bottom",
      });
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const idToken = await user.getIdToken();

      const res = await fetch("https://yara-91kd.onrender.com/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (res.ok) {
        console.log("✅ Login exitoso:", data);
        Toast.show({
          type: "success",
          text1: "Bienvenido de nuevo",
          text2: "✅ Has iniciado sesión correctamente 🚀",
          position: "bottom",
        });
        navigation.replace("Home");
      } else {
        console.log("❌ Error en login:", data);
        Toast.show({
          type: "error",
          text1: "Error en login",
          text2: data.message || "❌ No se pudo iniciar sesión",
          position: "bottom",
        });
      }
    } catch (error: any) {
      console.error("⚠️ Error en login:", error);
      Toast.show({
        type: "error",
        text1: "Error inesperado",
        text2: error.message || "⚠️ Ocurrió un problema al iniciar sesión.",
        position: "bottom",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Encabezado */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={[styles.logoText, { fontFamily: "Poppins-Bold" }]}>
              YARA
            </Text>
            <View style={styles.logoDot} />
          </View>
          <Text style={[styles.welcomeText, { fontFamily: "Poppins-Bold" }]}>
            Bienvenido de vuelta
          </Text>
          <Text style={[styles.subtitleText, { fontFamily: "Poppins" }]}>
            Inicia sesión para continuar con la nueva era de la agricultura
          </Text>
        </View>

        {/* Formulario */}
        <View style={styles.formContainer}>
          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { fontFamily: "Poppins" }]}>
              Correo electrónico
            </Text>
            <TextInput
              style={[styles.input, { fontFamily: "Poppins" }]}
              placeholder="tu@email.com"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { fontFamily: "Poppins" }]}>
              Contraseña
            </Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, { fontFamily: "Poppins" }]}
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={22}
                  color="#6b7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot password */}
          <TouchableOpacity style={styles.forgotPassword}>
            <Text
              style={[styles.forgotPasswordText, { fontFamily: "Poppins" }]}
            >
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>

          {/* Botón login */}
          <TouchableOpacity
            style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text
              style={[styles.primaryButtonText, { fontFamily: "Poppins-Bold" }]}
            >
              {isLoading ? "Iniciando..." : "Iniciar Sesión"}
            </Text>
          </TouchableOpacity>

          {/* Registro */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { fontFamily: "Poppins" }]}>
              ¿No tienes cuenta?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Registro")}>
              <Text style={[styles.footerLink, { fontFamily: "Poppins-Bold" }]}>
                Regístrate
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0fdf4" },
  scrollContainer: { flexGrow: 1, justifyContent: "center", padding: 24 },
  header: { alignItems: "center", marginBottom: 40 },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#15803d",
    letterSpacing: 2,
  },
  logoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#84cc16",
    marginLeft: 4,
  },
  welcomeText: {
    fontSize: 28,
    color: "#374151",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitleText: {
    fontSize: 16,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 24,
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, marginBottom: 8, color: "#374151" },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#374151",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#374151",
  },
  eyeButton: { paddingHorizontal: 12 },
  forgotPassword: { alignSelf: "flex-end", marginBottom: 24 },
  forgotPasswordText: { color: "#15803d", fontSize: 14 },
  primaryButton: {
    backgroundColor: "#15803d",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.7 },
  primaryButtonText: { color: "#fff", fontSize: 16 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
  footerText: { color: "#9ca3af", fontSize: 14 },
  footerLink: { color: "#15803d", fontSize: 14, marginLeft: 4 },
});
