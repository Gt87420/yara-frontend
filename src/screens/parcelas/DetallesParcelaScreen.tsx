// screens/parcelas/DetallesParcelaScreen.tsx
import React, { useEffect, useRef, useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import MapView, { Polygon, Marker, LatLng } from "react-native-maps";
import { RouteProp, useNavigation } from "@react-navigation/native";
import type { RootStackParamList } from "../../navigation/types";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { height } = Dimensions.get("window");

type DetallesParcelaRouteProp = RouteProp<
  RootStackParamList,
  "DetallesParcelaScreen"
>;

type Props = {
  route: DetallesParcelaRouteProp;
};

// ---------- Helpers ----------
function computeAreaHectareas(coords: LatLng[]): number {
  if (!coords || coords.length < 3) return 0;
  const meanLatRad =
    (coords.reduce((s, c) => s + c.latitude, 0) / coords.length) *
    (Math.PI / 180);
  const metersPerDegLat = 111132.92;
  const metersPerDegLon = 111412.84 * Math.cos(meanLatRad);
  const pts = coords.map((c) => ({
    x: c.longitude * metersPerDegLon,
    y: c.latitude * metersPerDegLat,
  }));
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    area += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
  }
  return Math.abs(area) / 2 / 10000; // hectáreas
}

function computePerimeter(coords: LatLng[]): number {
  if (!coords || coords.length < 2) return 0;
  let perimeter = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const lat1 = (coords[i].latitude * Math.PI) / 180;
    const lon1 = (coords[i].longitude * Math.PI) / 180;
    const lat2 = (coords[i + 1].latitude * Math.PI) / 180;
    const lon2 = (coords[i + 1].longitude * Math.PI) / 180;

    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    perimeter += 6371000 * c;
  }
  return perimeter; // metros
}

// ---------- Component ----------
export default function DetallesParcelaScreen({ route }: Props) {
  // NOTE: si tu RootStackParamList no define parámetros, evita errores en TS
  // llamando a route.params como any o ajustando el type en types.ts
  const parcela: any =
    (route && (route.params as any)?.parcela) || (route as any)?.params;
  const mapRef = useRef<MapView | null>(null);
  const navigation = useNavigation();
  const [mapReady, setMapReady] = useState(false);

  // Convertir coordenadas GeoJSON -> LatLng
  const coords: LatLng[] =
    (parcela?.ubicacion?.coordinates?.[0] || []).map((c: number[]) => ({
      latitude: c[1],
      longitude: c[0],
    })) || [];

  // métricas
  const areaHa = computeAreaHectareas(coords);
  const areaM2 = areaHa * 10000;
  const areaAcres = areaHa * 2.471;
  const perimeter = computePerimeter(coords);
  const numPuntos = coords.length;

  // función que intenta hacer fitToCoordinates; si falla, hace fallback con animateToRegion
  const fitToCoords = useCallback(() => {
    if (!mapRef.current || !coords || coords.length === 0) return;

    try {
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 100, right: 100, bottom: height * 0.45, left: 100 },
        animated: true,
      });
    } catch (err) {
      // fallback: calcular bounding box y animar a región
      const lats = coords.map((c) => c.latitude);
      const lons = coords.map((c) => c.longitude);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLon = Math.min(...lons);
      const maxLon = Math.max(...lons);
      const latitude = (minLat + maxLat) / 2;
      const longitude = (minLon + maxLon) / 2;
      // si la parcela es muy pequeña, dar un delta por defecto
      const latDelta = Math.max((maxLat - minLat) * 1.4, 0.005);
      const lonDelta = Math.max((maxLon - minLon) * 1.4, 0.005);
      mapRef.current.animateToRegion(
        {
          latitude,
          longitude,
          latitudeDelta: latDelta,
          longitudeDelta: lonDelta,
        },
        400
      );
    }
  }, [coords]);

  // Cuando el mapa esté listo o la pantalla gane foco, intentar el zoom.
  useEffect(() => {
    // 1) Si se actualizan coords en caliente, y el mapa ya está listo
    if (mapReady && coords.length > 0) {
      // darle un pequeño margen para asegurar renderizado completo
      const t = setTimeout(() => fitToCoords(), 80);
      return () => clearTimeout(t);
    }
    // no cleanup necesario si no se ejecuta
  }, [mapReady, coords, fitToCoords]);

  // 2) Suscribirse al foco de la pantalla (esto garantiza zoom cuando vuelves a ella)
  useEffect(() => {
    const unsub: any =
      // @ts-ignore: navigation typing en diferentes setups puede variar
      navigation?.addListener?.("focus", () => {
        // esperar un poquito si el mapa no está listo
        if (mapReady) {
          setTimeout(() => fitToCoords(), 80);
        } else {
          // poll hasta que mapReady true (limpieza por si se desmonta)
          let tries = 0;
          const id = setInterval(() => {
            tries++;
            if (mapReady) {
              clearInterval(id);
              fitToCoords();
            } else if (tries > 20) {
              clearInterval(id);
            }
          }, 100);
        }
      });

    return () => {
      try {
        unsub && unsub();
      } catch {}
    };
  }, [navigation, mapReady, fitToCoords]);

  return (
    <View style={styles.container}>
      {/* Mapa */}
      <MapView
        ref={(r) => {
          mapRef.current = r;
        }}
        style={styles.map}
        onMapReady={() => setMapReady(true)}
      >
        {coords.length > 0 && (
          <>
            <Polygon
              coordinates={coords}
              strokeColor="#2563eb"
              fillColor="rgba(37,99,235,0.2)"
              strokeWidth={3}
            />
            {coords.map((pt, i) => (
              <Marker key={i} coordinate={pt}>
                <View style={styles.marker}>
                  <Text style={styles.markerText}>{i + 1}</Text>
                </View>
              </Marker>
            ))}
          </>
        )}
      </MapView>

      {/* Botón atrás */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={22} color="#fff" />
      </TouchableOpacity>

      {/* Tarjeta inferior */}
      <View style={styles.infoContainer}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={["#059669", "#047857"]}
            style={styles.infoHeader}
          >
            <Text style={styles.infoTitle}>Estadísticas de Parcela</Text>
            <Text style={styles.infoSubtitle}>
              {parcela?.nombre ?? "Sin nombre"}
            </Text>
          </LinearGradient>

          <View style={styles.statsWrapper}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: "#10b98120" }]}>
                <Ionicons name="leaf" size={20} color="#10b981" />
              </View>
              <View>
                <Text style={styles.statLabel}>Área total</Text>
                <Text style={[styles.statValue, { color: "#10b981" }]}>
                  {areaHa.toFixed(2)} ha
                </Text>
                <Text style={styles.statSubValue}>{areaM2.toFixed(0)} m²</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: "#3b82f620" }]}>
                <Ionicons name="map" size={20} color="#3b82f6" />
              </View>
              <View>
                <Text style={styles.statLabel}>Perímetro</Text>
                <Text style={[styles.statValue, { color: "#3b82f6" }]}>
                  {perimeter > 1000
                    ? (perimeter / 1000).toFixed(2) + " km"
                    : perimeter.toFixed(0) + " m"}
                </Text>
                <Text style={styles.statSubValue}>Longitud del borde</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: "#f59e0b20" }]}>
                <Ionicons name="location" size={20} color="#f59e0b" />
              </View>
              <View>
                <Text style={styles.statLabel}>Puntos GPS</Text>
                <Text style={[styles.statValue, { color: "#f59e0b" }]}>
                  {numPuntos}
                </Text>
                <Text style={styles.statSubValue}>Coordenadas trazadas</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: "#8b5cf620" }]}>
                <Ionicons name="earth" size={20} color="#8b5cf6" />
              </View>
              <View>
                <Text style={styles.statLabel}>Estimaciones</Text>
                <Text style={[styles.statValue, { color: "#8b5cf6" }]}>
                  {areaAcres.toFixed(2)} acres
                </Text>
                <Text style={styles.statSubValue}>Conversión aproximada</Text>
              </View>
            </View>
          </View>

          {areaHa > 0 && (
            <View style={styles.recommendationsCard}>
              <Text style={styles.recommendationsTitle}>
                💡 Recomendaciones
              </Text>
              <Text style={styles.recommendationText}>
                • Para cultivos intensivos: {(areaHa * 0.8).toFixed(2)} ha
                útiles
              </Text>
              <Text style={styles.recommendationText}>
                • Capacidad estimada: ~{Math.ceil(areaHa * 100)} plantas/ha
              </Text>
              <Text style={styles.recommendationText}>
                • Tiempo de recorrido: ~{Math.ceil(perimeter / 100)} minutos
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  backButton: {
    position: "absolute",
    top: 48,
    left: 14,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 8,
    borderRadius: 20,
    zIndex: 20,
  },

  infoContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 6,
    maxHeight: height * 0.55,
  },

  infoHeader: {
    padding: 14,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  infoTitle: { fontSize: 16, fontWeight: "700", color: "white" },
  infoSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.95)", marginTop: 4 },

  statsWrapper: { padding: 14 },
  statCard: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statLabel: { fontSize: 13, color: "#6b7280" },
  statValue: { fontSize: 16, fontWeight: "700" },
  statSubValue: { fontSize: 12, color: "#9ca3af" },

  recommendationsCard: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  recommendationsTitle: { fontSize: 15, fontWeight: "700", marginBottom: 8 },
  recommendationText: { fontSize: 13, color: "#374151", marginBottom: 6 },

  marker: {
    backgroundColor: "#2563eb",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  markerText: { color: "white", fontWeight: "700" },
});
