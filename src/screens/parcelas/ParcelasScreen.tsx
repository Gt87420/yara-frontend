"use client";

import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StatusBar,
  Alert,
} from "react-native";
import MapView, { Polygon } from "react-native-maps";
import * as Location from "expo-location";
import { auth } from "../../firebase";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";
import { useFocusEffect } from "@react-navigation/native";
import BottomNavBar from "../../components/BottomNavBar";


type Props = NativeStackScreenProps<RootStackParamList, "Parcelas">;

const { height } = Dimensions.get("window");

export default function ParcelasScreen({ navigation }: Props) {
  const [parcelas, setParcelas] = useState<any[]>([]);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchParcelas();
    }, [])
  );

  // Token
  const getToken = async () => {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  };

  // GPS en tiempo real
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        subscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 1 },
          (loc) => {
            setLocation({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            });
          }
        );
      }
    })();

    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  // Fetch parcelas
  const fetchParcelas = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch(
        "https://yara-91kd.onrender.com/parcelas/usuario",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (Array.isArray(data)) {
        setParcelas(data);
      } else if (Array.isArray(data.parcelas)) {
        setParcelas(data.parcelas);
      } else {
        setParcelas([]);
      }
    } catch (err) {
      console.error("❌ Error cargando parcelas", err);
      setParcelas([]);
    }
  };

  // Eliminar parcela
  const handleDeleteParcela = async (id: string, nombre: string) => {
    Alert.alert(
      "Eliminar Parcela",
      `¿Estás seguro de que quieres eliminar la parcela "${nombre}"? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await getToken();
              if (!token) {
                Alert.alert("Error", "No se encontró token de autenticación");
                return;
              }

              const res = await fetch(
                `https://yara-91kd.onrender.com/parcelas/${id}/eliminar`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                }
              );

              if (res.ok) {
                setParcelas((prev) => prev.filter((p) => p._id !== id));
                Alert.alert(
                  "Éxito",
                  `Parcela "${nombre}" eliminada correctamente`
                );
              } else {
                Alert.alert("Error", "No se pudo eliminar la parcela");
              }
            } catch (err) {
              console.error("❌ Error eliminando parcela", err);
              Alert.alert("Error", "Ocurrió un error al eliminar la parcela");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Mis Parcelas</Text>
          <Text style={styles.headerSubtitle}>
            {parcelas.length}{" "}
            {parcelas.length === 1
              ? "parcela registrada"
              : "parcelas registradas"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("CrearParcela")}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* 🌍 Mapa */}
      <View style={styles.mapSection}>
        <TouchableOpacity
          style={styles.mapCard}
          onPress={() => navigation.navigate("CrearParcela")}
          activeOpacity={0.9}
        >
          <MapView
            style={styles.map}
            showsUserLocation
            showsMyLocationButton={false}
            showsCompass={false}
            toolbarEnabled={false}
            initialRegion={{
              latitude: 12.1364,
              longitude: -86.2514,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            region={
              location
                ? {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }
                : undefined
            }
          >
            {parcelas.map((p) => {
              const coords =
                Array.isArray(p.ubicacion?.coordinates?.[0]) &&
                p.ubicacion.coordinates[0].map((c: number[]) => ({
                  latitude: c[1],
                  longitude: c[0],
                }));

              if (!coords || coords.length === 0) return null;

              return (
                <Polygon
                  key={p._id}
                  coordinates={coords}
                  strokeColor="#059669"
                  fillColor="rgba(5,150,105,0.15)"
                  strokeWidth={3}
                />
              );
            })}
          </MapView>
          <View style={styles.mapOverlay}>
            <View style={styles.mapBadge}>
              <Text style={styles.mapBadgeText}>
                📍 Toca para agregar parcela
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* 📋 Lista de Parcelas */}
      <View style={styles.parcelasSection}>
        <Text style={styles.sectionTitle}>Tus Parcelas</Text>
        <FlatList
          data={parcelas}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.parcelaCard}>
              <View style={styles.parcelaHeader}>
                <View style={styles.parcelaInfo}>
                  <Text style={styles.parcelaTitle}>{item.nombre}</Text>
                  <View style={styles.areaContainer}>
                    <Text style={styles.areaIcon}>🌾</Text>
                    <Text style={styles.parcelaArea}>
                      {item.areaHectareas} hectáreas
                    </Text>
                  </View>
                </View>
                <View style={styles.parcelaActions}>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteParcela(item._id, item.nombre)}
                  >
                    <Text style={styles.deleteIcon}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Botones de acción */}
              <View style={styles.actionButtons}>
                {/* 👉 Ahora solo navega a la vista de clima */}
                <TouchableOpacity
                  style={[styles.actionButton, styles.weatherActionButton]}
                  onPress={async () => {
                    try {
                      const token = await getToken();
                      if (!token) {
                        Alert.alert(
                          "Error",
                          "No se encontró token de autenticación"
                        );
                        return;
                      }

                      // 🔹 Pide el clima de esa parcela
                      const res = await fetch(
                        `https://yara-91kd.onrender.com/parcelas/${item._id}/clima`,
                        {
                          headers: { Authorization: `Bearer ${token}` },
                        }
                      );

                      const data = await res.json();

                      // 🔹 Navega y pasa el clima + la parcela
                      navigation.navigate("Clima", {
                        parcelaId: item._id, // 👈 solo el id
                      });
                    } catch (err) {
                      console.error("❌ Error cargando clima", err);
                      Alert.alert("Error", "No se pudo cargar el clima");
                    }
                  }}
                >
                  <Text style={styles.actionButtonIcon}>🌤️</Text>
                  <Text style={styles.actionButtonText}>Ver Clima</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.detailsActionButton]}
                  onPress={() =>
                    navigation.navigate("DetallesParcelaScreen", {
                      parcela: item,
                    })
                  }
                >
                  <Text style={styles.actionButtonIcon}>📊</Text>
                  <Text style={styles.actionButtonText}>Detalles</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text
              style={{ textAlign: "center", marginTop: 20, color: "#6b7280" }}
            >
              No hay parcelas registradas
            </Text>
          }
        />
      </View>
      {/* Barra de navegación */}
        <BottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#ffffff",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1f2937",
    letterSpacing: -0.5,
  },
  headerSubtitle: { fontSize: 14, color: "#6b7280", marginTop: 2 },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonText: { fontSize: 24, fontWeight: "600", color: "#ffffff" },
  mapSection: { paddingHorizontal: 20, marginBottom: 24 },
  mapCard: {
    height: 200,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#f8fafc",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  map: { flex: 1 },
  mapOverlay: { position: "absolute", top: 16, left: 16, right: 16 },
  mapBadge: {
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapBadgeText: { fontSize: 12, fontWeight: "600", color: "#374151" },
  parcelasSection: { flex: 1, paddingHorizontal: 20 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 16,
  },
  listContainer: { paddingBottom: 20 },
  parcelaCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  parcelaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  parcelaInfo: { flex: 1 },
  parcelaTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 6,
  },
  areaContainer: { flexDirection: "row", alignItems: "center" },
  areaIcon: { fontSize: 14, marginRight: 6 },
  parcelaArea: { fontSize: 14, color: "#6b7280", fontWeight: "500" },
  parcelaActions: { marginLeft: 12 },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fef2f2",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  deleteIcon: { fontSize: 18 },
  actionButtons: { flexDirection: "row", gap: 12 },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  weatherActionButton: {
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#e0f2fe",
  },
  detailsActionButton: { backgroundColor: "#059669" },
  actionButtonIcon: { fontSize: 16 },
  actionButtonText: { fontSize: 14, fontWeight: "600" },
});
