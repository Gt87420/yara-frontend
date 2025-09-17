import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import Toast from "react-native-toast-message";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      Toast.show({
        type: "success",
        text1: "👋 Sesión cerrada",
        text2: "Vuelve pronto a YARA 🌱",
        position: "bottom",
      });
      navigation.replace("Login", { google: false });
    } catch (error: any) {
      console.error("❌ Error al cerrar sesión:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo cerrar sesión",
        position: "bottom",
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏡 Bienvenido a YARA</Text>
      <Text style={styles.subtitle}>Tu panel principal de agricultura 🚀</Text>

      {/* 📌 Ir a Cultivos */}
      <TouchableOpacity style={styles.card} activeOpacity={0.7}>
        <Ionicons name="leaf" size={28} color="#15803d" />
        <Text style={styles.cardText}>Mis cultivos</Text>
      </TouchableOpacity>

      {/* 📌 Ir a Estadísticas */}
      <TouchableOpacity style={styles.card} activeOpacity={0.7}>
        <Ionicons name="analytics" size={28} color="#2563eb" />
        <Text style={styles.cardText}>Estadísticas</Text>
      </TouchableOpacity>

      {/* 📌 Ir a Configuración */}
      <TouchableOpacity style={styles.card} activeOpacity={0.7}>
        <Ionicons name="settings" size={28} color="#6b7280" />
        <Text style={styles.cardText}>Configuración</Text>
      </TouchableOpacity>

      {/* 📌 Ir a Parcelas */}
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => navigation.navigate("Parcelas")}
      >
        <Ionicons name="map" size={28} color="#0ea5e9" />
        <Text style={styles.cardText}>Mis Parcelas</Text>
      </TouchableOpacity>

      {/* 🚪 Botón de cerrar sesión */}
      <TouchableOpacity
        onPress={handleLogout}
        style={styles.logoutButton}
        activeOpacity={0.7}
      >
        <Ionicons name="log-out-outline" size={28} color="#dc2626" />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0fdf4",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#15803d",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 30,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardText: {
    fontSize: 18,
    marginLeft: 12,
    color: "#374151",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#dc2626",
    backgroundColor: "#fee2e2",
    padding: 16,
    borderRadius: 12,
    marginTop: 30,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  logoutText: {
    fontSize: 18,
    marginLeft: 12,
    color: "#dc2626",
    fontWeight: "600",
  },
});
