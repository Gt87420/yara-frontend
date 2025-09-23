"use client"

import { useState, useEffect, useMemo } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Dimensions,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native"
import MapView, { Polygon, Marker, type LatLng, MapPressEvent } from "react-native-maps"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import * as Location from "expo-location"
import { auth } from "../../firebase"
import Toast from "react-native-toast-message"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import type { RootStackParamList } from "../../navigation/types"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { BlurView } from "expo-blur"

import ParcelStatsModal from "../../components/Parcelas/ParcelStatsModal"
import TutorialOverlay from "../../components/Parcelas/TutorialOverlay"
import LoadingOverlay from "../../components/Parcelas/LoadingOverlay"
import BottomNavBar from "../../components/BottomNavBar";

type Props = NativeStackScreenProps<RootStackParamList, "CrearParcela">

const { width, height } = Dimensions.get("window")

export default function CrearParcelaScreenComplete({ navigation }: Props) {
  const insets = useSafeAreaInsets()

  const [polygonCoords, setPolygonCoords] = useState<LatLng[]>([])
  const [parcelaName, setParcelaName] = useState("")
  const [location, setLocation] = useState<LatLng | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [showStatsModal, setShowStatsModal] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("Cargando...")
  const [saveProgress, setSaveProgress] = useState<number | undefined>()

  useEffect(() => {
    // mostrar tutorial SIEMPRE que se abre
    setShowTutorial(true)
  }, [])

  const getToken = async () => {
    const user = auth.currentUser
    if (!user) return null
    return await user.getIdToken()
  }

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permisos de ubicación", "Necesitamos acceso a tu ubicación para crear parcelas")
        return null
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
      const coord = { latitude: loc.coords.latitude, longitude: loc.coords.longitude }
      setLocation(coord)
      return coord
    } catch (error) {
      Alert.alert("Error", "No se pudo obtener la ubicación actual")
      return null
    }
  }

  useEffect(() => {
    getCurrentLocation()
    StatusBar.setBarStyle("light-content")
  }, [])

  /** 👉 Agregar puntos tocando en el mapa */
  const handleMapPress = (event: MapPressEvent) => {
    const coord = event.nativeEvent.coordinate
    setPolygonCoords((prev) => [...prev, coord])
    Toast.show({
      type: "success",
      text1: "Punto agregado",
      text2: `Punto ${polygonCoords.length + 1} añadido correctamente`,
      position: "top",
      topOffset: 100,
    })
  }

  const ensureClosed = (coords: LatLng[]) => {
    if (coords.length === 0) return coords
    const first = coords[0]
    const last = coords[coords.length - 1]
    if (first.latitude === last.latitude && first.longitude === last.longitude) return coords
    return [...coords, first]
  }

  const computeAreaHectareas = (coords: LatLng[]) => {
    if (coords.length < 3) return 0
    const meanLatRad = (coords.reduce((s, c) => s + c.latitude, 0) / coords.length) * (Math.PI / 180)
    const metersPerDegLat = 111132.92
    const metersPerDegLon = 111412.84 * Math.cos(meanLatRad)
    const pts = coords.map((c) => ({
      x: c.longitude * metersPerDegLon,
      y: c.latitude * metersPerDegLat,
    }))
    let area = 0
    for (let i = 0; i < pts.length; i++) {
      const j = (i + 1) % pts.length
      area += pts[i].x * pts[j].y - pts[j].x * pts[i].y
    }
    return Math.abs(area) / 2 / 10000
  }

  const computePerimeter = (coords: LatLng[]) => {
    if (coords.length < 2) return 0
    let perimeter = 0
    for (let i = 0; i < coords.length - 1; i++) {
      const lat1 = (coords[i].latitude * Math.PI) / 180
      const lon1 = (coords[i].longitude * Math.PI) / 180
      const lat2 = (coords[i + 1].latitude * Math.PI) / 180
      const lon2 = (coords[i + 1].longitude * Math.PI) / 180

      const dLat = lat2 - lat1
      const dLon = lon2 - lon1
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      perimeter += 6371000 * c
    }
    return perimeter
  }

  const handleSave = async () => {
    if (polygonCoords.length < 3) {
      Alert.alert("Parcela incompleta", "Necesitas al menos 3 puntos para crear una parcela válida")
      return
    }

    if (!parcelaName.trim()) {
      Alert.alert("Nombre requerido", "Por favor ingresa un nombre para tu parcela")
      return
    }

    setIsLoading(true)
    setSaveProgress(0)
    setLoadingMessage("Preparando datos...")

    try {
      setSaveProgress(25)
      const closed = ensureClosed(polygonCoords)
      const coordinates = [closed.map((c) => [c.longitude, c.latitude])]
      const areaHectareas = computeAreaHectareas(closed)

      if (areaHectareas === 0) {
        Alert.alert("Error", "El área calculada es inválida (0 ha)")
        return
      }

      setSaveProgress(50)
      setLoadingMessage("Obteniendo autenticación...")

      const token = await getToken()
      if (!token) return

      const user = auth.currentUser
      if (!user) {
        Alert.alert("Error", "No hay usuario logueado")
        return
      }

      setSaveProgress(75)
      setLoadingMessage("Guardando parcela...")

      const body = {
        usuarioUid: user.uid,
        nombre: parcelaName.trim(),
        ubicacion: { type: "Polygon", coordinates },
        areaHectareas,
        tipoSuelo: "franco arenoso",
      }

      console.log("📤 Enviando body:", JSON.stringify(body, null, 2))

      const res = await fetch("https://yara-91kd.onrender.com/parcelas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      const text = await res.text()
      console.log("📥 Status:", res.status)
      console.log("📥 Response:", text)

      setSaveProgress(100)

      if (res.ok) {
        Toast.show({
          type: "success",
          text1: "¡Parcela creada exitosamente!",
          text2: `${parcelaName} - ${areaHectareas.toFixed(2)} ha`,
          position: "top",
          topOffset: 100,
        })
        setTimeout(() => navigation.goBack(), 1000)
      } else {
        Toast.show({
          type: "error",
          text1: `Error ${res.status}`,
          text2: text,
          position: "top",
          topOffset: 100,
        })
      }
    } catch (error) {
      console.error("❌ Error al guardar parcela:", error)
      Toast.show({
        type: "error",
        text1: "Error de conexión",
        text2: "Verifica tu conexión a internet",
        position: "top",
        topOffset: 100,
      })
    } finally {
      setTimeout(() => {
        setIsLoading(false)
        setSaveProgress(undefined)
      }, 1000)
    }
  }

  const handleCancel = () => {
    if (polygonCoords.length > 0 || parcelaName.trim()) {
      Alert.alert("¿Cancelar creación?", "Se perderán todos los datos", [
        { text: "Continuar editando", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: () => {
            setPolygonCoords([])
            setParcelaName("")
            navigation.goBack()
          },
        },
      ])
    } else navigation.goBack()
  }

  const handleClearPoints = () => {
    if (polygonCoords.length > 0) {
      Alert.alert("¿Limpiar todos los puntos?", "Esta acción no se puede deshacer", [
        { text: "Cancelar", style: "cancel" },
        { text: "Limpiar", style: "destructive", onPress: () => setPolygonCoords([]) },
      ])
    }
  }

  const area = useMemo(() => computeAreaHectareas(polygonCoords), [polygonCoords])
  const perimeter = useMemo(() => computePerimeter(polygonCoords), [polygonCoords])

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor="#059669" />

      {/* Header */}
      <LinearGradient colors={["#059669", "#047857"]} style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleCancel}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Crear Parcela</Text>
          <Text style={styles.headerSubtitle}>
            {polygonCoords.length === 1 ? "1 punto agregado" : `${polygonCoords.length} puntos`}
          </Text>
        </View>

        <TouchableOpacity style={styles.headerButton} onPress={() => setShowStatsModal(true)}>
          <Ionicons name="stats-chart" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      <KeyboardAvoidingView style={styles.keyboardContainer} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        {/* Map Container */}
        <View style={styles.mapContainer}>
          <MapView
            style={StyleSheet.absoluteFill}
            showsUserLocation
            showsMyLocationButton
            mapType="hybrid"
            onPress={handleMapPress}
            region={
              location
                ? { latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }
                : undefined
            }
          >
            {polygonCoords.length > 2 && (
              <Polygon
                coordinates={polygonCoords}
                strokeColor="#059669"
                fillColor="rgba(5,150,105,0.2)"
                strokeWidth={3}
                lineDashPattern={[5, 5]}
              />
            )}
            {polygonCoords.map((point, index) => (
              <Marker key={index} coordinate={point}>
                <View style={styles.customMarker}>
                  <LinearGradient colors={["#10b981", "#059669"]} style={styles.markerGradient}>
                    <Text style={styles.markerText}>{index + 1}</Text>
                  </LinearGradient>
                </View>
              </Marker>
            ))}
          </MapView>
        </View>

        <View style={styles.bottomPanel}>
          <BlurView intensity={100} style={styles.panelBlur}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              {/* Input Section */}
              <View style={styles.inputSection}>
                <View style={styles.inputContainer}>
                  <Ionicons name="leaf" size={20} color="#059669" style={styles.inputIcon} />
                  <TextInput
                    placeholder="Nombre de la parcela"
                    placeholderTextColor="#6b7280"
                    value={parcelaName}
                    onChangeText={setParcelaName}
                    style={styles.input}
                    maxLength={50}
                    returnKeyType="done"
                  />
                </View>

                {/* Area Info */}
                <View style={styles.areaContainer}>
                  <View style={styles.areaInfo}>
                    <Text style={styles.areaLabel}>Área calculada</Text>
                    <Text style={styles.areaValue}>
                      {area.toFixed(2)} <Text style={styles.areaUnit}>ha</Text>
                    </Text>
                  </View>
                  {polygonCoords.length > 0 && (
                    <TouchableOpacity style={styles.clearButton} onPress={handleClearPoints}>
                      <Ionicons name="refresh" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </ScrollView>
          </BlurView>
        </View>

        <View style={[styles.actionsContainer, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={handleSave}
            disabled={isLoading || polygonCoords.length < 3 || !parcelaName.trim()}
          >
            <LinearGradient
              colors={polygonCoords.length >= 3 && parcelaName.trim() ? ["#3b82f6", "#2563eb"] : ["#9ca3af", "#6b7280"]}
              style={styles.buttonGradient}
            >
              <Ionicons name="save" size={20} color="white" />
              <Text style={styles.buttonText}>{isLoading ? "Guardando..." : "Guardar Parcela"}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Modals */}
      <ParcelStatsModal
        visible={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        area={area}
        perimeter={perimeter}
        pointsCount={polygonCoords.length}
        parcelName={parcelaName}
      />

      {/* Tutorial se abre SIEMPRE */}
      <TutorialOverlay visible={showTutorial} onClose={() => setShowTutorial(false)} onComplete={() => setShowTutorial(false)} />

      <LoadingOverlay visible={isLoading} message={loadingMessage} progress={saveProgress} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === "ios" ? 12 : 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "white" },
  headerSubtitle: { fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  keyboardContainer: { flex: 1 },
  mapContainer: { flex: 1, width: "100%" },
  customMarker: { alignItems: "center", justifyContent: "center" },
  markerGradient: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  markerText: { color: "white", fontWeight: "700", fontSize: 12 },
  bottomPanel: {
    height: 140,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  panelBlur: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 16, paddingBottom: 8 },
  inputSection: { flex: 1 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inputIcon: { marginRight: 8, opacity: 0.7 },
  input: { flex: 1, fontSize: 16, color: "#111827", fontWeight: "500", paddingVertical: 4, minHeight: 24 },
  areaContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  areaInfo: { flexDirection: "row", alignItems: "baseline" },
  areaLabel: { fontSize: 14, color: "#374151", marginRight: 6 },
  areaValue: { fontSize: 18, fontWeight: "700", color: "#111827" },
  areaUnit: { fontSize: 14, color: "#6b7280", marginLeft: 4 },
  clearButton: {
    backgroundColor: "#fee2e2",
    padding: 6,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingHorizontal: 16,
  },
  actionButton: { flex: 1, borderRadius: 12, overflow: "hidden" },
  saveButton: { marginRight: 8 },
  buttonGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: { color: "white", fontWeight: "700", fontSize: 16, marginLeft: 8 },
})
