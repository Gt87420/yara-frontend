import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { BlurView } from "expo-blur"

interface ParcelStatsModalProps {
  visible: boolean
  onClose: () => void
  area: number
  perimeter: number
  pointsCount: number
  parcelName: string
}

export default function ParcelStatsModal({
  visible,
  onClose,
  area,
  perimeter,
  pointsCount,
  parcelName,
}: ParcelStatsModalProps) {
  const stats = [
    {
      icon: "resize",
      label: "Área Total",
      value: `${area.toFixed(4)} ha`,
      subValue: `${(area * 10000).toFixed(0)} m²`,
      color: "#059669",
    },
    {
      icon: "git-network",
      label: "Perímetro",
      value: `${(perimeter / 1000).toFixed(2)} km`,
      subValue: `${perimeter.toFixed(0)} metros`,
      color: "#3b82f6",
    },
    {
      icon: "location",
      label: "Puntos GPS",
      value: `${pointsCount} puntos`,
      subValue: pointsCount >= 3 ? "Parcela válida" : "Mínimo 3 puntos",
      color: pointsCount >= 3 ? "#10b981" : "#f59e0b",
    },
    {
      icon: "calculator",
      label: "Estimación",
      value: area > 0 ? `~${Math.ceil(area * 2.47)} acres` : "0 acres",
      subValue: "Conversión aproximada",
      color: "#8b5cf6",
    },
  ]

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <BlurView intensity={50} style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <LinearGradient colors={["#059669", "#047857"]} style={styles.modalHeader}>
            <View style={styles.headerContent}>
              <Text style={styles.modalTitle}>Estadísticas de Parcela</Text>
              <Text style={styles.modalSubtitle}>{parcelName || "Sin nombre"}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                  <Ionicons name={stat.icon as any} size={24} color={stat.color} />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                  <Text style={styles.statSubValue}>{stat.subValue}</Text>
                </View>
              </View>
            ))}

            {area > 0 && (
              <View style={styles.recommendationsCard}>
                <Text style={styles.recommendationsTitle}>💡 Recomendaciones</Text>
                <View style={styles.recommendation}>
                  <Text style={styles.recommendationText}>
                    • Para cultivos intensivos: {(area * 0.8).toFixed(2)} ha útiles
                  </Text>
                </View>
                <View style={styles.recommendation}>
                  <Text style={styles.recommendationText}>
                    • Capacidad estimada: ~{Math.ceil(area * 100)} plantas/ha
                  </Text>
                </View>
                <View style={styles.recommendation}>
                  <Text style={styles.recommendationText}>
                    • Tiempo de recorrido: ~{Math.ceil(perimeter / 100)} minutos
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </BlurView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    padding: 20,
  },
  statCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 2,
  },
  statSubValue: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 1,
  },
  recommendationsCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  recommendation: {
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
  },
})
