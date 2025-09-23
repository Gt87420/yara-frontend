"use client";

import { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";
import departamentosData from "../../data/departamentos.json";
import { Ionicons } from "@expo/vector-icons";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Toast from "react-native-toast-message";

type Props = NativeStackScreenProps<RootStackParamList, "Registro">;

export default function Registro({ navigation }: Props) {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [tipoProductor, setTipoProductor] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
  });

  if (!fontsLoaded) return null;

  const getPasswordStrength = (pwd: string) => {
    let strength = 0;
    const criteria = [
      pwd.length >= 8,
      /[A-Z]/.test(pwd),
      /[0-9]/.test(pwd),
      /[^A-Za-z0-9]/.test(pwd),
    ];
    strength = criteria.filter(Boolean).length;

    if (strength <= 1) return { label: "Débil", color: "#be123c", bars: 1 };
    if (strength === 2) return { label: "Media", color: "#d97706", bars: 2 };
    if (strength === 3) return { label: "Buena", color: "#84cc16", bars: 3 };
    return { label: "Fuerte", color: "#22c55e", bars: 4 };
  };

  const municipiosDisponibles =
    departamentosData.find((d) => d.departamento === departamento)
      ?.municipios || [];

  const passwordStrength = getPasswordStrength(password);

  const PasswordStrengthBars = ({ strength }: { strength: any }) => (
    <View style={{ flexDirection: "row", gap: 4, marginTop: 8 }}>
      {[1, 2, 3, 4].map((bar) => (
        <View
          key={bar}
          style={{
            flex: 1,
            height: 4,
            borderRadius: 4,
            backgroundColor: bar <= strength.bars ? strength.color : "#e5e7eb",
          }}
        />
      ))}
    </View>
  );

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Contraseñas no coinciden",
        text2: "❌ Verifica que ambas contraseñas sean iguales.",
        position: "bottom",
      });
      return;
    }
    if (password.length < 8) {
      Toast.show({
        type: "error",
        text1: "Contraseña débil",
        text2: "⚠️ Debe tener al menos 8 caracteres.",
        position: "bottom",
      });
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const idToken = await user.getIdToken();
      const ubicacion = `${departamento}, ${municipio}`;

      const res = await fetch("https://yara-91kd.onrender.com/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          nombre,
          telefono,
          ubicacion,
          tipoProductor,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        Toast.show({
          type: "success",
          text1: "Registro exitoso",
          text2: "✅ Ahora puedes iniciar sesión con tu cuenta 🚀",
          position: "bottom",
        });
        navigation.replace("Login", { google: false });
      } else {
        Toast.show({
          type: "error",
          text1: "Error en registro",
          text2: data.message || "❌ No se pudo registrar",
          position: "bottom",
        });
      }
    } catch (error: any) {
      console.error("🚨 Error en registro:", error);
      Toast.show({
        type: "error",
        text1: "Error inesperado",
        text2: error.message,
        position: "bottom",
      });
    }
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: "#f0fdf4" }}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        padding: 16,
      }}
      enableOnAndroid={true}
      extraScrollHeight={150}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require("../../../assets/img/YARALOGO.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.subtitle}>
          Únete a la Nueva Era de la Agricultura
        </Text>
      </View>

      {/* Datos personales */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>👤 Datos Personales</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre Completo</Text>
          <TextInput
            placeholder="Ingresa tu nombre completo"
            value={nombre}
            onChangeText={setNombre}
            style={styles.input}
            placeholderTextColor="#9ca3af"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            placeholder="Número de teléfono"
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
            style={styles.input}
            placeholderTextColor="#9ca3af"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Correo Electrónico</Text>
          <TextInput
            placeholder="tu@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      {/* Seguridad */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🔒 Seguridad</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Crea una contraseña segura"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={styles.passwordInput}
              placeholderTextColor="#9ca3af"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={22}
                color="#6b7280"
              />
            </TouchableOpacity>
          </View>

          {/* Reglas dinámicas */}
          {password.length > 0 && (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.helper}>Recomendaciones:</Text>
              <Text
                style={[
                  styles.rule,
                  { color: password.length >= 8 ? "green" : "red" },
                ]}
              >
                {password.length >= 8 ? "✅" : "❌"} Al menos 8 caracteres
              </Text>
              <Text
                style={[
                  styles.rule,
                  { color: /[A-Z]/.test(password) ? "green" : "red" },
                ]}
              >
                {/[A-Z]/.test(password) ? "✅" : "❌"} Una letra mayúscula
              </Text>
              <Text
                style={[
                  styles.rule,
                  { color: /[0-9]/.test(password) ? "green" : "red" },
                ]}
              >
                {/[0-9]/.test(password) ? "✅" : "❌"} Un número
              </Text>
              <Text
                style={[
                  styles.rule,
                  { color: /[^A-Za-z0-9]/.test(password) ? "green" : "red" },
                ]}
              >
                {/[^A-Za-z0-9]/.test(password) ? "✅" : "❌"} Un símbolo
                especial
              </Text>
            </View>
          )}

          {/* Barra de fuerza */}
          {password.length > 0 && (
            <View style={{ marginTop: 12 }}>
              <View style={styles.strengthRow}>
                <Text style={styles.helper}>Seguridad de la contraseña</Text>
                <Text
                  style={[
                    styles.helper,
                    {
                      color: passwordStrength.color,
                      fontFamily: "Poppins_500Medium",
                    },
                  ]}
                >
                  {passwordStrength.label}
                </Text>
              </View>
              <PasswordStrengthBars strength={passwordStrength} />
            </View>
          )}
        </View>

        {/* Confirmación */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirmar Contraseña</Text>
          <TextInput
            placeholder="Confirma tu contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
            style={styles.input}
            placeholderTextColor="#9ca3af"
          />

          {/* Validación */}
          {confirmPassword.length > 0 && (
            <Text
              style={{
                marginTop: 6,
                fontSize: 13,
                fontFamily: "Poppins_400Regular",
                color: confirmPassword === password ? "green" : "red",
              }}
            >
              {confirmPassword === password
                ? "✅ Las contraseñas coinciden"
                : "❌ Las contraseñas no coinciden"}
            </Text>
          )}
        </View>
      </View>

      {/* Ubicación */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>📍 Ubicación</Text>

        {/* Departamento */}
        <Text style={styles.label}>Departamento</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={departamento}
            onValueChange={setDepartamento}
            style={styles.picker}
            dropdownIconColor="#15803d"
          >
            <Picker.Item
              label="Seleccione un departamento..."
              value=""
              style={styles.placeholder}
            />
            {departamentosData.map((dep) => (
              <Picker.Item
                key={dep.departamento}
                label={dep.departamento}
                value={dep.departamento}
                style={styles.pickerItem}
              />
            ))}
          </Picker>
        </View>

        {/* Municipio */}
        <Text style={styles.label}>Municipio</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={municipio}
            onValueChange={setMunicipio}
            style={styles.picker}
            dropdownIconColor="#15803d"
          >
            <Picker.Item
              label="Seleccione un municipio..."
              value=""
              style={styles.placeholder}
            />
            {municipiosDisponibles.map((mun) => (
              <Picker.Item
                key={mun}
                label={mun}
                value={mun}
                style={styles.pickerItem}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Tipo de Productor */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🌱 Tipo de Productor</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={tipoProductor}
            onValueChange={setTipoProductor}
          >
            <Picker.Item label="Seleccione tipo de productor..." value="" />
            <Picker.Item label="🌱 Cafetalero" value="Cafetalero" />
            <Picker.Item label="🐄 Ganadero" value="Ganadero" />
            <Picker.Item label="🌾 Agricultor" value="Agricultor" />
          </Picker>
        </View>
      </View>

      {/* Botón */}
      <TouchableOpacity onPress={handleRegister} style={styles.button}>
        <Text style={styles.buttonText}>Crear Cuenta</Text>
      </TouchableOpacity>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", marginBottom: 16, },
  logo: {
    marginTop: 40,
    marginBottom: 10,
    width: 80,
    height: 80,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "#374151",
  },
  rule: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    marginTop: 4,
  },
  /* Ubicación */
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: "#111827",
    marginBottom: 12,
  },
  inputGroup: { marginBottom: 16 },
  label: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: "#111827",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderColor: "#d1d5db",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    fontFamily: "Poppins_400Regular",
    color: "#111827",
  },
  pickerContainer: {
    backgroundColor: "#f9fafb",
    borderColor: "#d1d5db",
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
  },
  picker: {
    color: "#111827",
    fontFamily: "Poppins_400Regular",
  },
  pickerItem: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
  },
  placeholder: {
    color: "#9ca3af",
    fontFamily: "Poppins_400Regular",
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
    fontFamily: "Poppins_400Regular",
  },
  eyeButton: { paddingHorizontal: 12 },
  strengthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  helper: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#6b7280",
  },
  button: {
    backgroundColor: "#15803d",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 32,
  },
  buttonText: {
    color: "#fff",
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
  },
});
