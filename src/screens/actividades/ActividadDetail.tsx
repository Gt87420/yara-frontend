"use client"

import { useState, useCallback } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from "react-native"
import { useRoute, useNavigation, useFocusEffect } from "@react-navigation/native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import actividadService from "../../api/actividadService"

const ActividadDetail = () => {
  const route = useRoute<any>()
  const navigation = useNavigation<any>()
  const { id } = route.params
  const [actividad, setActividad] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useFocusEffect(
    useCallback(() => {
      const fetchActividad = async () => {
        try {
          setLoading(true)
          const data = await actividadService.getById(id)
          setActividad(data)
        } catch (e) {
          Alert.alert("Error", "No se pudo cargar la actividad")
        } finally {
          setLoading(false)
        }
      }
      fetchActividad()
    }, [id]),
  )

  const handleDelete = async () => {
    Alert.alert("Confirmar eliminación", "¿Estás seguro de que deseas eliminar esta actividad?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await actividadService.remove(id)
            Alert.alert("Eliminado", "La actividad fue eliminada")
            navigation.goBack()
          } catch (e) {
            Alert.alert("Error", "No se pudo eliminar")
          }
        },
      },
    ])
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "No definido"
    const date = new Date(dateStr)
    return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`
  }

  const getActivityIcon = (tipo: string) => {
    const icons: { [key: string]: string } = {
      Riego: "💧",
      Fertilización: "🌱",
      Cosecha: "🌾",
      Siembra: "🌿",
      Fumigación: "🚿",
      Poda: "✂️",
      default: "📋",
    }
    return icons[tipo] || icons.default
  }

  const getStatusColor = (estado: string) => {
    const colors: { [key: string]: string } = {
      Pendiente: "#A7C97B",
      Completada: "#4BAE4F",
      Cancelada: "#E74C3C",
      default: "#666",
    }
    return colors[estado] || colors.default
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#4BAE4F" />
          <Text style={styles.loadingText}>Cargando detalles de la actividad...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!actividad) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>No se pudo cargar la información de la actividad</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalles de Actividad</Text>
        <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate("ActividadEdit", { id })}>
          <Ionicons name="pencil" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <View style={styles.heroContent}>
            <Text style={styles.activityIcon}>{getActivityIcon(actividad.tipoActividad)}</Text>
            <Text style={styles.activityTitle}>{actividad.tipoActividad || "Sin tipo"}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(actividad.estado) }]}>
              <Text style={styles.statusText}>{actividad.estado || "Desconocido"}</Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Stats Card */}
          <View style={styles.statsCard}>
            <Text style={styles.cardTitle}>📊 Fechas de la Actividad</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>📅</Text>
                <Text style={styles.statLabel}>Programada</Text>
                <Text style={styles.statValue}>{formatDate(actividad.fechaProgramada)}</Text>
              </View>
              {actividad.fechaReal && (
                <View style={styles.statItem}>
                  <Text style={styles.statIcon}>✅</Text>
                  <Text style={styles.statLabel}>Realizada</Text>
                  <Text style={styles.statValue}>{formatDate(actividad.fechaReal)}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Description Card */}
          {actividad.descripcion && (
            <View style={styles.descriptionCard}>
              <Text style={styles.cardTitle}>📝 Descripción</Text>
              <Text style={styles.descriptionText}>{actividad.descripcion}</Text>
            </View>
          )}

          {/* Details Card */}
          <View style={styles.detailsCard}>
            <Text style={styles.cardTitle}>📋 Información Detallada</Text>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Text style={styles.detailIconText}>{getActivityIcon(actividad.tipoActividad)}</Text>
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Tipo de Actividad</Text>
                <Text style={styles.detailValue}>{actividad.tipoActividad || "Sin tipo"}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Text style={styles.detailIconText}>🔄</Text>
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Estado Actual</Text>
                <Text style={styles.detailValue}>{actividad.estado || "Desconocido"}</Text>
              </View>
            </View>

            {actividad.parcela && (
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Text style={styles.detailIconText}>🗺️</Text>
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Parcela</Text>
                  <Text style={styles.detailValue}>{actividad.parcela}</Text>
                </View>
              </View>
            )}

            {actividad.cultivo && (
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Text style={styles.detailIconText}>🌾</Text>
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Cultivo</Text>
                  <Text style={styles.detailValue}>{actividad.cultivo}</Text>
                </View>
              </View>
            )}

            {actividad.insumos && actividad.insumos.length > 0 && (
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Text style={styles.detailIconText}>📦</Text>
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Insumos Utilizados</Text>
                  <Text style={styles.detailValue}>{actividad.insumos.length} insumo(s)</Text>
                </View>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate("ActividadEdit", { id })}>
              <Ionicons name="pencil" size={18} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.primaryButtonText}>Editar Actividad</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.dangerButton} onPress={handleDelete}>
              <Ionicons name="trash" size={18} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.dangerButtonText}>Eliminar Actividad</Text>
            </TouchableOpacity>
          </View>

          {/* Tips Card */}
          <View style={styles.tipsCard}>
            <Text style={styles.cardTitle}>💡 Recordatorio</Text>
            <Text style={styles.tipsText}>
              Asegúrate de completar esta actividad en la fecha programada para mantener el ciclo de cultivo en óptimas
              condiciones. Puedes marcarla como completada desde la opción de editar.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAF9",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F8FAF9",
  },
  loadingContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#1E5631",
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAF9",
  },
  errorText: {
    fontSize: 16,
    color: "#1E5631",
    textAlign: "center",
    paddingHorizontal: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#1E5631",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    flex: 1,
  },
  heroContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#A7C97B",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  heroContent: {
    padding: 32,
    alignItems: "center",
  },
  activityIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  activityTitle: {
    color: "#1E5631",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    padding: 20,
  },
  statsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E5631",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F8FAF9",
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    textAlign: "center",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E5631",
    textAlign: "center",
  },
  descriptionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  descriptionText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#A7C97B",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  detailIconText: {
    fontSize: 18,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1E5631",
  },
  actionButtons: {
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: "#4BAE4F",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#4BAE4F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    flexDirection: "row",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  dangerButton: {
    backgroundColor: "#E74C3C",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#E74C3C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    flexDirection: "row",
    justifyContent: "center",
  },
  dangerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonIcon: {
    marginRight: 8,
  },
  tipsCard: {
    backgroundColor: "#A7C97B",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  tipsText: {
    fontSize: 14,
    color: "#1E5631",
    lineHeight: 20,
  },
})

export default ActividadDetail
