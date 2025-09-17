"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  Dimensions,
  StatusBar,
} from "react-native"
import MapView, { Polygon } from "react-native-maps"
import * as Location from "expo-location"
import { auth } from "../../firebase"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import type { RootStackParamList } from "../../navigation/types"

type Props = NativeStackScreenProps<RootStackParamList, "Parcelas">

const { width, height } = Dimensions.get("window")

export default function ParcelasScreen({ navigation }: Props) {
  const [parcelas, setParcelas] = useState<any[]>([])
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [selectedClima, setSelectedClima] = useState<any | null>(null)

  // Token
  const getToken = async () => {
    const user = auth.currentUser
    if (!user) return null
    return await user.getIdToken()
  }

  // GPS con actualización en tiempo real
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null
    ;(async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status === "granted") {
        subscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 1 },
          (loc) => {
            setLocation({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            })
          },
        )
      }
    })()

    return () => {
      if (subscription) subscription.remove()
    }
  }, [])

  // Fetch parcelas
  const fetchParcelas = async () => {
    try {
      const token = await getToken()
      if (!token) return
      const res = await fetch("https://yara-91kd.onrender.com/parcelas/usuario", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) setParcelas(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("❌ fetchParcelas", err)
    }
  }

  useEffect(() => {
    fetchParcelas()
  }, [])

  // Clima
  const handleGetClima = async (id: string) => {
    try {
      const token = await getToken()
      if (!token) return
      const res = await fetch(`https://yara-91kd.onrender.com/parcelas/${id}/clima`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setSelectedClima(data)
    } catch (err) {
      console.error("❌ clima", err)
    }
  }

  const getClimaField = (obj: any) => {
    if (!obj) return {}
    const clima = obj.clima ?? obj.current ?? obj
    return {
      temp: clima?.temperaturaActual ?? clima?.temp ?? clima?.main?.temp ?? clima?.current?.temp,
      humidity: clima?.humedad ?? clima?.humidity ?? clima?.main?.humidity,
      description: clima?.descripcion ?? clima?.weather?.[0]?.description ?? clima?.main?.description,
    }
  }

  const climaInfo = getClimaField(selectedClima)

  const getWeatherIcon = (description: string) => {
    if (!description) return "🌤️"
    const desc = description.toLowerCase()
    if (desc.includes("lluvia") || desc.includes("rain")) return "🌧️"
    if (desc.includes("nublado") || desc.includes("cloud")) return "☁️"
    if (desc.includes("sol") || desc.includes("clear") || desc.includes("sunny")) return "☀️"
    if (desc.includes("tormenta") || desc.includes("storm")) return "⛈️"
    if (desc.includes("nieve") || desc.includes("snow")) return "❄️"
    if (desc.includes("niebla") || desc.includes("fog")) return "🌫️"
    return "🌤️"
  }

  const getTempColor = (temp: number) => {
    if (temp >= 30) return "#dc2626" // Rojo para calor
    if (temp >= 20) return "#f59e0b" // Naranja para templado
    if (temp >= 10) return "#059669" // Verde para fresco
    return "#3b82f6" // Azul para frío
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Mis Parcelas</Text>
          <Text style={styles.headerSubtitle}>
            {parcelas.length} {parcelas.length === 1 ? "parcela registrada" : "parcelas registradas"}
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("CrearParcela")}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mapSection}>
        <TouchableOpacity
          style={styles.mapCard}
          onPress={() => navigation.navigate("CrearParcela")}
          activeOpacity={0.9}
        >
          <MapView
            style={styles.map}
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
            showsUserLocation
            showsMyLocationButton={false}
            showsCompass={false}
            toolbarEnabled={false}
          >
            {parcelas.map((p) => (
              <Polygon
                key={p._id}
                coordinates={p.ubicacion.coordinates[0].map((c: number[]) => ({
                  latitude: c[1],
                  longitude: c[0],
                }))}
                strokeColor="#059669"
                fillColor="rgba(5,150,105,0.15)"
                strokeWidth={3}
              />
            ))}
          </MapView>
          <View style={styles.mapOverlay}>
            <View style={styles.mapBadge}>
              <Text style={styles.mapBadgeText}>📍 Toca para agregar parcela</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

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
                    <Text style={styles.parcelaArea}>{item.areaHectareas} hectáreas</Text>
                  </View>
                </View>
                <View style={styles.parcelaActions}>
                  <TouchableOpacity style={styles.weatherButton} onPress={() => handleGetClima(item._id)}>
                    <Text style={styles.weatherIcon}>🌦️</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.weatherActionButton]}
                  onPress={() => handleGetClima(item._id)}
                >
                  <Text style={styles.actionButtonIcon}>🌤️</Text>
                  <Text style={styles.actionButtonText}>Ver Clima</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionButton, styles.detailsActionButton]}>
                  <Text style={styles.actionButtonIcon}>📊</Text>
                  <Text style={styles.actionButtonText}>Detalles</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>

      <Modal visible={!!selectedClima} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalCard}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header del modal */}
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleContainer}>
                    <Text style={styles.modalTitle}>{selectedClima?.parcela ?? "Información del Clima"}</Text>
                    <TouchableOpacity onPress={() => setSelectedClima(null)} style={styles.closeButton}>
                      <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Clima actual */}
                <View style={styles.currentWeatherCard}>
                  <View style={styles.currentWeatherHeader}>
                    <Text style={styles.currentWeatherTitle}>Clima Actual</Text>
                    <Text style={styles.weatherIconLarge}>{getWeatherIcon(climaInfo.description)}</Text>
                  </View>

                  <View style={styles.weatherMetrics}>
                    <View style={styles.weatherMetric}>
                      <View style={styles.metricIconContainer}>
                        <Text style={styles.metricIcon}>🌡️</Text>
                      </View>
                      <View style={styles.metricInfo}>
                        <Text style={styles.metricLabel}>Temperatura</Text>
                        <Text style={[styles.metricValue, { color: getTempColor(climaInfo.temp || 20) }]}>
                          {climaInfo.temp ?? "n/a"} °C
                        </Text>
                      </View>
                    </View>

                    <View style={styles.weatherMetric}>
                      <View style={styles.metricIconContainer}>
                        <Text style={styles.metricIcon}>💧</Text>
                      </View>
                      <View style={styles.metricInfo}>
                        <Text style={styles.metricLabel}>Humedad</Text>
                        <Text style={styles.metricValue}>{climaInfo.humidity ?? "n/a"} %</Text>
                      </View>
                    </View>

                    <View style={styles.weatherMetric}>
                      <View style={styles.metricIconContainer}>
                        <Text style={styles.metricIcon}>☁️</Text>
                      </View>
                      <View style={styles.metricInfo}>
                        <Text style={styles.metricLabel}>Condiciones</Text>
                        <Text style={styles.metricValue}>{climaInfo.description ?? "n/a"}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Pronóstico */}
                {selectedClima?.pronostico5Dias && (
                  <View style={styles.forecastSection}>
                    <Text style={styles.forecastTitle}>Pronóstico 5 Días</Text>
                    <View style={styles.forecastContainer}>
                      {selectedClima.pronostico5Dias.map((f: any, i: number) => (
                        <View key={i} style={styles.forecastCard}>
                          <Text style={styles.forecastDate}>
                            {f.fecha
                              ? new Date(f.fecha).toLocaleDateString("es-ES", {
                                  weekday: "short",
                                  day: "numeric",
                                })
                              : `Día ${i + 1}`}
                          </Text>
                          <Text style={styles.forecastIcon}>{getWeatherIcon(f.descripcion)}</Text>
                          <Text style={[styles.forecastTemp, { color: getTempColor(f.temp || 20) }]}>{f.temp}°C</Text>
                          <Text style={styles.forecastDesc}>{f.descripcion}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
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
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
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
  addButtonText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#ffffff",
  },
  mapSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
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
  map: {
    flex: 1,
  },
  mapOverlay: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
  },
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
  mapBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  parcelasSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
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
  parcelaInfo: {
    flex: 1,
  },
  parcelaTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 6,
  },
  areaContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  areaIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  parcelaArea: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  parcelaActions: {
    marginLeft: 12,
  },
  weatherButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f9ff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0f2fe",
  },
  weatherIcon: {
    fontSize: 18,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
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
  detailsActionButton: {
    backgroundColor: "#059669",
  },
  actionButtonIcon: {
    fontSize: 16,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.85,
    minHeight: height * 0.5,
  },
  modalCard: {
    flex: 1,
    padding: 24,
  },
  modalHeader: {
    marginBottom: 24,
  },
  modalTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1f2937",
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  currentWeatherCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  currentWeatherHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  currentWeatherTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  weatherIconLarge: {
    fontSize: 32,
  },
  weatherMetrics: {
    gap: 16,
  },
  weatherMetric: {
    flexDirection: "row",
    alignItems: "center",
  },
  metricIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  metricIcon: {
    fontSize: 18,
  },
  metricInfo: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
  },
  forecastSection: {
    marginTop: 8,
  },
  forecastTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 16,
  },
  forecastContainer: {
    gap: 12,
  },
  forecastCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  forecastDate: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    width: 50,
    textAlign: "center",
  },
  forecastIcon: {
    fontSize: 20,
    width: 40,
    textAlign: "center",
  },
  forecastTemp: {
    fontSize: 16,
    fontWeight: "700",
    width: 60,
    textAlign: "center",
  },
  forecastDesc: {
    fontSize: 12,
    color: "#6b7280",
    flex: 1,
    textAlign: "left",
    marginLeft: 12,
  },
})
