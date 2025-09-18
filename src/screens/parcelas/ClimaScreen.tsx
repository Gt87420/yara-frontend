"use client"

// ClimaScreen.tsx - Redesigned with modern, elegant and innovative design
import { useEffect, useState } from "react"
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from "react-native"
import { type RouteProp, useRoute } from "@react-navigation/native"
import type { RootStackParamList } from "../../navigation/types"
import { auth } from "../../firebase"
import { LinearGradient } from "expo-linear-gradient"

const { width } = Dimensions.get("window")

// 🔹 Helpers reutilizados (sin cambios en la lógica)
const getClimaField = (clima: any, field: string) => {
  if (!clima) return "n/a"

  switch (field) {
    case "descripcion":
      return clima?.descripcion ?? clima?.weather?.[0]?.description ?? "n/a"
    case "temp":
      return clima?.temperaturaActual ?? clima?.temp ?? clima?.main?.temp ?? "n/a"
    case "temp_min":
      return clima?.temperaturaMin ?? clima?.temp_min ?? clima?.main?.temp_min ?? "n/a"
    case "temp_max":
      return clima?.temperaturaMax ?? clima?.temp_max ?? clima?.main?.temp_max ?? "n/a"
    case "humedad":
      return clima?.humedad ?? clima?.main?.humidity ?? "n/a"
    case "presion":
      return clima?.presion ?? clima?.main?.pressure ?? "n/a"
    case "vientoVel":
      return clima?.vientoVelocidad ?? clima?.vientoVel ?? clima?.wind?.speed ?? "n/a"
    case "vientoDir":
      return clima?.vientoDireccion ?? clima?.vientoDir ?? clima?.wind?.deg ?? "n/a"
    default:
      return clima[field] ?? "n/a"
  }
}

const getWeatherIcon = (descripcion: string) => {
  if (!descripcion) return "🌥️"
  const d = descripcion.toLowerCase()
  if (d.includes("lluvia")) return "🌧️"
  if (d.includes("nube")) return "☁️"
  if (d.includes("sol") || d.includes("despejado")) return "☀️"
  if (d.includes("tormenta")) return "⛈️"
  return "🌥️"
}

// 🔹 Nueva función para formatear los timestamps
const formatTime = (timestamp?: number) => {
  if (!timestamp) return "n/a"
  try {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return "n/a"
  }
}

export default function ClimaScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "Clima">>()
  const { parcelaId } = route.params

  const [climaActual, setClimaActual] = useState<any>(null)
  const [pronostico, setPronostico] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // 🔹 Función para traer el token del usuario
  const getToken = async () => {
    const user = auth.currentUser
    if (!user) return null
    return await user.getIdToken()
  }

  // 🔹 Fetch clima al entrar a la vista
  useEffect(() => {
    const fetchClima = async () => {
      try {
        const token = await getToken()
        if (!token) return

        const res = await fetch(`https://yara-91kd.onrender.com/parcelas/${parcelaId}/clima`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const data = await res.json()
        console.log("🌤️ Respuesta clima:", data)

        if (res.ok && data) {
          setClimaActual(data.clima ?? null)
          setPronostico((data.pronostico5Dias ?? []).slice(0, 5))
        } else {
          setClimaActual(null)
          setPronostico([])
        }
      } catch (err) {
        console.error("❌ Error cargando clima", err)
        setClimaActual(null)
        setPronostico([])
      } finally {
        setLoading(false)
      }
    }

    fetchClima()
  }, [parcelaId])

  if (loading) {
    return (
      <LinearGradient colors={["#0f172a", "#164e63", "#0891b2"]} style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#84cc16" />
          <Text style={styles.loadingText}>Cargando clima...</Text>
        </View>
      </LinearGradient>
    )
  }

  if (!climaActual) {
    return (
      <LinearGradient colors={["#0f172a", "#164e63", "#0891b2"]} style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>🌧️</Text>
          <Text style={styles.errorText}>No se encontró información del clima para esta parcela.</Text>
        </View>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient colors={["#0f172a", "#164e63", "#0891b2"]} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 🔹 Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.locationText}>Clima de la Parcela</Text>
            <View style={styles.headerDot} />
          </View>
        </View>

        {/* 🔹 Clima Actual */}
        <View style={styles.currentWeatherContainer}>
          <View style={styles.currentWeatherCard}>
            <View style={styles.temperatureSection}>
              <Text style={styles.currentTemp}>{getClimaField(climaActual, "temp")}</Text>
              <View style={styles.tempUnit}>
                <Text style={styles.degreeSymbol}>°</Text>
                <Text style={styles.weatherIcon}>{getWeatherIcon(getClimaField(climaActual, "descripcion"))}</Text>
              </View>
            </View>

            <Text style={styles.weatherDescription}>{getClimaField(climaActual, "descripcion")}</Text>

            <View style={styles.tempRangeContainer}>
              <Text style={styles.tempRangeLabel}>Máx/Mín</Text>
              <Text style={styles.tempRange}>
                {getClimaField(climaActual, "temp_max")}° / {getClimaField(climaActual, "temp_min")}°
              </Text>
            </View>
          </View>
        </View>

        {/* 🔹 Detalles */}
        <View style={styles.detailsContainer}>
          {/* ... tarjetas humedad, viento, etc ... */}
        </View>

        {/* 🔹 Amanecer y Atardecer (timestamps convertidos) */}
        <View style={styles.sunTimesContainer}>
          <View style={styles.sunTimesCard}>
            <View style={styles.sunTimeItem}>
              <View style={styles.sunIconContainer}>
                <Text style={styles.sunIcon}>🌅</Text>
              </View>
              <Text style={styles.sunLabel}>Amanecer</Text>
              <Text style={styles.sunTime}>{formatTime(climaActual.amanecer)}</Text>
            </View>

            <View style={styles.sunDivider} />

            <View style={styles.sunTimeItem}>
              <View style={styles.sunIconContainer}>
                <Text style={styles.sunIcon}>🌇</Text>
              </View>
              <Text style={styles.sunLabel}>Atardecer</Text>
              <Text style={styles.sunTime}>{formatTime(climaActual.atardecer)}</Text>
            </View>
          </View>
        </View>

        {/* 🔹 Pronóstico */}
        {/* 🔹 Pronóstico 5 días - Diseño innovador */}
        {pronostico.length > 0 && (
          <View style={styles.forecastSection}>
            <View style={styles.forecastHeader}>
              <Text style={styles.forecastTitle}>Pronóstico 5 días</Text>
              <View style={styles.forecastIndicator} />
            </View>

            <View style={styles.forecastContainer}>
              {pronostico.map((item, index) => {
                const getDetailedWeatherIcon = (descripcion: string, probabilidadLluvia: number) => {
                  if (!descripcion) return "☁️"
                  const d = descripcion.toLowerCase()
                  const rainProb = probabilidadLluvia || 0

                  if (d.includes("tormenta") || (d.includes("lluvia") && rainProb > 0.7)) return "⛈️"
                  if (d.includes("lluvia") || rainProb > 0.5) return "🌧️"
                  if (d.includes("nube") && d.includes("sol")) return "⛅"
                  if (d.includes("nube")) return "☁️"
                  if (d.includes("sol") || d.includes("despejado")) return "☀️"
                  return "☁️"
                }

                const getDayName = (fecha: string, index: number) => {
                  if (index === 0) return "Hoy"
                  if (index === 1) return "Mañana"

                  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
                  const today = new Date()
                  const targetDate = new Date(today)
                  targetDate.setDate(today.getDate() + index)
                  return days[targetDate.getDay()]
                }

                return (
                  <View key={index} style={[styles.forecastCard, index === 0 && styles.forecastCardToday]}>
                    <View style={styles.forecastDay}>
                      <Text style={[styles.dayName, index === 0 && styles.dayNameToday]}>
                        {getDayName(item.fecha, index)}
                      </Text>
                    </View>

                    <View style={styles.forecastWeather}>
                      <Text style={styles.weatherIconForecast}>
                        {getDetailedWeatherIcon(item.descripcion, item.probabilidadLluvia ?? 0)}
                      </Text>

                      <View style={styles.rainContainer}>
                        <Text style={styles.rainIcon}>💧</Text>
                        <Text style={styles.rainPercent}>{Math.round((item.probabilidadLluvia ?? 0) * 100)}%</Text>
                      </View>
                    </View>

                    <View style={styles.forecastTemp}>
                      <Text style={styles.tempMax}>{item.tempMax ?? item.temp}°</Text>
                      <Text style={styles.tempMin}>{item.tempMin ?? item.temp}°</Text>
                    </View>
                  </View>
                )
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 30,
    borderRadius: 20,
  },
  loadingText: {
    color: "#ffffff",
    fontSize: 18,
    marginTop: 15,
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  errorIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  errorText: {
    color: "#ffffff",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "400",
    lineHeight: 26,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  locationText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  headerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#84cc16",
    marginLeft: 10,
  },
  currentWeatherContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  currentWeatherCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 30,
    padding: 35,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  temperatureSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  currentTemp: {
    color: "#ffffff",
    fontSize: 80,
    fontWeight: "200",
    letterSpacing: -2,
  },
  tempUnit: {
    alignItems: "center",
    marginLeft: 10,
    marginTop: 5,
  },
  degreeSymbol: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "300",
  },
  weatherIcon: {
    fontSize: 50,
    marginTop: 5,
  },
  weatherDescription: {
    color: "#ffffff",
    fontSize: 20,
    marginBottom: 15,
    textTransform: "capitalize",
    fontWeight: "500",
    textAlign: "center",
  },
  tempRangeContainer: {
    alignItems: "center",
  },
  tempRangeLabel: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    marginBottom: 5,
    fontWeight: "500",
  },
  tempRange: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  detailsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  detailCard: {
    width: (width - 50) / 2,
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  detailCardPrimary: {
    backgroundColor: "rgba(132, 204, 22, 0.2)",
  },
  detailCardSecondary: {
    backgroundColor: "rgba(56, 189, 248, 0.2)",
  },
  detailCardTertiary: {
    backgroundColor: "rgba(251, 146, 60, 0.2)",
  },
  detailCardQuaternary: {
    backgroundColor: "rgba(168, 85, 247, 0.2)",
  },
  detailIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  detailIcon: {
    fontSize: 24,
  },
  detailLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  detailValue: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
  sunTimesContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sunTimesCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 25,
    padding: 25,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  sunTimeItem: {
    flex: 1,
    alignItems: "center",
  },
  sunIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  sunIcon: {
    fontSize: 22,
  },
  sunLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    marginBottom: 5,
    fontWeight: "500",
  },
  sunTime: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  sunDivider: {
    width: 2,
    height: 50,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: 25,
    borderRadius: 1,
  },
  forecastSection: {
    paddingHorizontal: 20,
  },
  forecastHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  forecastTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  forecastIndicator: {
    width: 30,
    height: 4,
    backgroundColor: "#84cc16",
    borderRadius: 2,
    marginLeft: 15,
  },
  forecastContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 25,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  forecastCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  forecastCardToday: {
    backgroundColor: "rgba(132, 204, 22, 0.15)",
    borderRadius: 15,
    marginHorizontal: -10,
    paddingHorizontal: 10,
    borderBottomColor: "transparent",
  },
  forecastDay: {
    width: 70,
  },
  dayName: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  dayNameToday: {
    color: "#84cc16",
    fontWeight: "700",
  },
  forecastWeather: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 20,
  },
  weatherIconForecast: {
    fontSize: 32,
  },
  rainContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  rainIcon: {
    fontSize: 14,
    marginRight: 5,
  },
  rainPercent: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  forecastTemp: {
    alignItems: "flex-end",
    minWidth: 60,
  },
  tempMax: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
  },
  tempMin: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 16,
    fontWeight: "500",
  },
})
