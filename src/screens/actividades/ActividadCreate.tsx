"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Switch,
  ScrollView,
  ActivityIndicator,
} from "react-native"
import { Picker } from "@react-native-picker/picker"
import DateTimePicker from "@react-native-community/datetimepicker"
import actividadService from "../../api/actividadService"
import { useNavigation } from "@react-navigation/native"
import { auth } from "../../firebase"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { showMessage } from "react-native-flash-message"

const ActividadCreate = () => {
  const navigation = useNavigation<any>()
  const [usuarioUid, setUsuarioUid] = useState("")
  const [parcelas, setParcelas] = useState<any[]>([])
  const [cultivos, setCultivos] = useState<any[]>([])
  const [insumos, setInsumos] = useState<any[]>([])

  const [parcelaId, setParcelaId] = useState("")
  const [cultivoId, setCultivoId] = useState("")
  const [tipoActividad, setTipoActividad] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [fechaProgramada, setFechaProgramada] = useState(new Date())
  const [insumosUsados, setInsumosUsados] = useState<string[]>([])

  const [showDatePicker, setShowDatePicker] = useState(false)
  const [recordar, setRecordar] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const user = auth.currentUser
    if (!user) return
    setUsuarioUid(user.uid)
    fetchParcelas()
    fetchCultivos()
    fetchInsumos()
  }, [])

  const fetchParcelas = async () => {
    try {
      const user = auth.currentUser
      if (!user) return
      const token = await user.getIdToken()
      const res = await fetch("https://yara-91kd.onrender.com/parcelas/usuario", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setParcelas(Array.isArray(data) ? data : data.parcelas || [])
    } catch (err) {
      console.error("Error cargando parcelas:", err)
    }
  }

  const fetchCultivos = async () => {
    try {
      const user = auth.currentUser
      if (!user) return
      const token = await user.getIdToken()
      const res = await fetch("https://yara-91kd.onrender.com/cultivos", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setCultivos(Array.isArray(data) ? data : data.cultivos || [])
    } catch (err) {
      console.error("Error cargando cultivos:", err)
    }
  }

  const fetchInsumos = async () => {
    try {
      const user = auth.currentUser
      if (!user) return
      const token = await user.getIdToken()
      const res = await fetch("https://yara-91kd.onrender.com/insumos/usuario", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setInsumos(Array.isArray(data) ? data : data.insumos || [])
    } catch (err) {
      console.error("Error cargando insumos:", err)
    }
  }

  const handleCreate = async () => {
    if (!parcelaId || !cultivoId || !tipoActividad) {
      Alert.alert("Error", "Por favor completa todos los campos obligatorios")
      return
    }

    setLoading(true)

    try {
      const data = {
        usuarioUid,
        parcelaId,
        cultivoId,
        tipoActividad,
        descripcion,
        fechaProgramada: fechaProgramada.toISOString(),
        estado: "pendiente",
        insumosUsados,
      }

      await actividadService.create(data)

      showMessage({
        message: "Éxito",
        description: "✅ Actividad creada correctamente",
        type: "success",
        icon: "success",
        duration: 2000,
        position: "top",
        style: { marginTop: 60 },
      })

      navigation.goBack()
    } catch (e) {
      console.error(e)
      showMessage({
        message: "Error",
        description: "No se pudo crear la actividad",
        type: "danger",
        icon: "danger",
        style: { marginTop: 60 },
      })
    } finally {
      setLoading(false)
    }
  }

  const removeInsumo = (id: string) => {
    setInsumosUsados(insumosUsados.filter((insumoId) => insumoId !== id))
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear Actividad</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Ubicación */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Text style={styles.sectionIconText}>📍</Text>
            </View>
            <Text style={styles.sectionTitle}>Ubicación</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Selecciona Parcela *</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={parcelaId} onValueChange={(value) => setParcelaId(value)} style={styles.picker}>
                <Picker.Item label="-- Selecciona Parcela --" value="" />
                {parcelas.map((p) => (
                  <Picker.Item key={p._id} label={p.nombre} value={p._id} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Selecciona Cultivo *</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={cultivoId} onValueChange={(value) => setCultivoId(value)} style={styles.picker}>
                <Picker.Item label="-- Selecciona Cultivo --" value="" />
                {cultivos.map((c) => (
                  <Picker.Item key={c._id} label={c.cultivo} value={c._id} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        {/* Detalles de la Actividad */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Text style={styles.sectionIconText}>✏️</Text>
            </View>
            <Text style={styles.sectionTitle}>Detalles de la Actividad</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tipo de Actividad *</Text>
            <TextInput
              style={styles.input}
              value={tipoActividad}
              onChangeText={setTipoActividad}
              placeholder="Ej: Fertilización, Riego, Cosecha"
              placeholderTextColor="#A7C97B"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Descripción</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Describe los detalles de la actividad..."
              placeholderTextColor="#A7C97B"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Programación */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Text style={styles.sectionIconText}>📅</Text>
            </View>
            <Text style={styles.sectionTitle}>Programación</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Fecha Programada *</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={20} color="#4BAE4F" />
              <Text style={styles.dateButtonText}>{formatDate(fechaProgramada)}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={fechaProgramada}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                themeVariant={Platform.OS === "android" ? "dark" : undefined}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === "ios")
                  if (selectedDate) setFechaProgramada(selectedDate)
                }}
                textColor="#1E5631"
              />
            )}
          </View>

          <View style={styles.reminderContainer}>
            <View style={styles.reminderContent}>
              <Ionicons name="notifications-outline" size={24} color="#4BAE4F" />
              <Text style={styles.reminderText}>Recordarme esta actividad</Text>
            </View>
            <Switch
              value={recordar}
              onValueChange={setRecordar}
              trackColor={{ false: "#E8EAE6", true: "#A7C97B" }}
              thumbColor={recordar ? "#4BAE4F" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Insumos */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Text style={styles.sectionIconText}>🧪</Text>
            </View>
            <Text style={styles.sectionTitle}>Insumos a Utilizar</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Añadir Insumos</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue=""
                onValueChange={(value) => {
                  if (value && !insumosUsados.includes(value)) {
                    setInsumosUsados([...insumosUsados, value])
                  }
                }}
                style={styles.picker}
              >
                <Picker.Item label="-- Añadir Insumo --" value="" />
                {insumos.map((i) => (
                  <Picker.Item key={i._id} label={i.nombre} value={i._id} />
                ))}
              </Picker>
            </View>
          </View>

          {insumosUsados.length > 0 && (
            <View style={styles.insumosSelectedContainer}>
              <Text style={styles.insumosSelectedTitle}>Insumos Seleccionados ({insumosUsados.length})</Text>
              {insumosUsados.map((id) => {
                const insumo = insumos.find((i) => i._id === id)
                return (
                  <View key={id} style={styles.insumoChip}>
                    <Text style={styles.insumoChipText}>{insumo ? insumo.nombre : id}</Text>
                    <TouchableOpacity onPress={() => removeInsumo(id)}>
                      <Ionicons name="close-circle" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                )
              })}
            </View>
          )}
        </View>

        {/* Botón de Crear */}
        <TouchableOpacity style={styles.createButton} onPress={handleCreate} disabled={loading}>
          <Text style={styles.createButtonText}>{loading ? "Creando..." : "✓ Crear Actividad"}</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4BAE4F" />
          <Text style={styles.loadingText}>Creando actividad...</Text>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1FDFD",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4BAE4F",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E5631",
  },
  headerSpacer: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#A7C97B",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sectionIconText: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E5631",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E5631",
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#000000",
    backgroundColor: "#FFFFFF",
  },
  textArea: {
    minHeight: 100,
    paddingTop: 16,
  },
  pickerContainer: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  picker: {
    color: "#1E5631",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FDF9",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    gap: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: "#1E5631",
    fontWeight: "500",
  },
  reminderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FDF9",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  reminderContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  reminderText: {
    fontSize: 16,
    color: "#1E5631",
    fontWeight: "500",
  },
  insumosSelectedContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#F8FDF9",
    borderRadius: 12,
  },
  insumosSelectedTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E5631",
    marginBottom: 12,
  },
  insumoChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#A7C97B",
  },
  insumoChipText: {
    fontSize: 14,
    color: "#1E5631",
    fontWeight: "500",
    flex: 1,
  },
  createButton: {
    backgroundColor: "#4BAE4F",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginTop: 30,
    shadowColor: "#4BAE4F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  bottomSpacer: {
    height: 30,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  loadingText: {
    marginTop: 12,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default ActividadCreate
