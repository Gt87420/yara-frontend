import { View, Text, StyleSheet, FlatList } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import Toast from "react-native-toast-message";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import BottomNavBar from "../../components/BottomNavBar";
import { CultivoService } from "../../api/cultivoService";

export default function HomeScreen() {
  const [cultivos, setCultivos] = useState<any[]>([]);

  const cargarCultivos = async () => {
    try {
      const data = await CultivoService.obtenerTodosUsuario();
      setCultivos(data);
    } catch (err) {
      console.error("❌ Error cargando cultivos:", err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarCultivos();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏡 Bienvenido a YARA</Text>
      <Text style={styles.subtitle}>Tus cultivos recientes 🌱</Text>

      <FlatList
        data={cultivos}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.cultivo}</Text>
            <Text style={styles.detail}>Etapa: {item.etapa}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No tienes cultivos todavía</Text>
        }
      />

      {/* Barra de navegación */}
      <BottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0fdf4", padding: 20 },
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
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  name: { fontSize: 18, fontWeight: "600", color: "#374151" },
  detail: { fontSize: 14, color: "#6b7280" },
  empty: { textAlign: "center", color: "#9ca3af", marginTop: 20 },
});
