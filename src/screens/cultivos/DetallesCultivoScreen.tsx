"use client";

import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { CultivoService } from "../../api/cultivoService";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomNavBar from "../../components/BottomNavBar";

type Cultivo = {
  _id: string;
  cultivo: string;
  etapa: string;
  fechaInicio: string;
  fechaFin?: string;
  rendimientoEsperado: number;
  imagen?: string;
};

export default function DetallesCultivoScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { id } = route.params;
  const [cultivo, setCultivo] = useState<Cultivo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await CultivoService.obtenerPorId(id);
        setCultivo(data);
      } catch (err) {
        console.error("❌ Error cargando cultivo:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "No definido";
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#4BAE4F" />
          <Text style={styles.loadingText}>
            Cargando detalles del cultivo...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!cultivo) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>
          No se pudo cargar la información del cultivo
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalles del Cultivo</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            navigation.navigate("EditarCultivo", {
              id: cultivo._id, // PASAMOS EL ID correctamente
            })
          }
        >
          <Text style={styles.editButtonText}>✏️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          {cultivo.imagen ? (
            <Image
              source={{ uri: cultivo.imagen }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderIcon}>🌱</Text>
              <Text style={styles.placeholderText}>Sin imagen disponible</Text>
            </View>
          )}
          <View style={styles.imageOverlay}>
            <Text style={styles.cultivoTitle}>{cultivo.cultivo}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{cultivo.etapa}</Text>
            </View>
          </View>
        </View>

        {/* Contenido Principal */}
        <View style={styles.content}>
          {/* Resumen */}
          <View style={styles.statsCard}>
            <Text style={styles.cardTitle}>📊 Resumen del Cultivo</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>📅</Text>
                <Text style={styles.statLabel}>Inicio</Text>
                <Text style={styles.statValue}>
                  {formatDate(cultivo.fechaInicio)}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>🏁</Text>
                <Text style={styles.statLabel}>Fin Estimado</Text>
                <Text style={styles.statValue}>
                  {formatDate(cultivo.fechaFin)}
                </Text>
              </View>
            </View>
          </View>

          {/* Rendimiento */}
          <View style={styles.performanceCard}>
            <Text style={styles.cardTitle}>📈 Rendimiento Esperado</Text>
            <View style={styles.performanceContent}>
              <Text style={styles.performanceIcon}>🎯</Text>
              <View style={styles.performanceInfo}>
                <Text style={styles.performanceValue}>
                  {cultivo.rendimientoEsperado}
                </Text>
                <Text style={styles.performanceLabel}>
                  Toneladas por hectárea
                </Text>
              </View>
            </View>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
          </View>

          {/* Información Detallada */}
          <View style={styles.detailsCard}>
            <Text style={styles.cardTitle}>📋 Información Detallada</Text>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Text style={styles.detailIconText}>🌾</Text>
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Tipo de Cultivo</Text>
                <Text style={styles.detailValue}>{cultivo.cultivo}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Text style={styles.detailIconText}>🔄</Text>
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Etapa Actual</Text>
                <Text style={styles.detailValue}>{cultivo.etapa}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Text style={styles.detailIconText}>⏱️</Text>
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Duración del Ciclo</Text>
                <Text style={styles.detailValue}>
                  {cultivo.fechaFin
                    ? `${Math.ceil(
                        (new Date(cultivo.fechaFin).getTime() -
                          new Date(cultivo.fechaInicio).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )} días`
                    : "En curso"}
                </Text>
              </View>
            </View>
          </View>

          {/* Botones de acción */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate("EditarCultivo", { cultivo })}
            >
              <Text style={styles.primaryButtonText}>📝 Editar Cultivo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>📊 Ver Reportes</Text>
            </TouchableOpacity>
          </View>

          {/* Consejos */}
          <View style={styles.tipsCard}>
            <Text style={styles.cardTitle}>💡 Consejos para esta Etapa</Text>
            <Text style={styles.tipsText}>
              En la etapa de {cultivo.etapa.toLowerCase()}, es importante
              mantener un riego constante y monitorear posibles plagas.
              Considera aplicar fertilizantes orgánicos para mejorar el
              rendimiento.
            </Text>
          </View>
        </View>
        </ScrollView>
        {/* Barra de navegación */}
        <BottomNavBar />
    </SafeAreaView>
  );
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
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
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
  editButtonText: {
    fontSize: 18,
  },
  scrollContainer: {
    flex: 1,
  },
  imageContainer: {
    position: "relative",
    height: 280,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#A7C97B",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  placeholderText: {
    color: "#1E5631",
    fontSize: 16,
    fontWeight: "500",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(30, 86, 49, 0.8)",
    padding: 20,
  },
  cultivoTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#4BAE4F",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
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
  performanceCard: {
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
  performanceContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  performanceIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  performanceInfo: {
    flex: 1,
  },
  performanceValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4BAE4F",
  },
  performanceLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    width: "75%",
    backgroundColor: "#4BAE4F",
    borderRadius: 4,
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
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#4BAE4F",
  },
  secondaryButtonText: {
    color: "#4BAE4F",
    fontSize: 16,
    fontWeight: "600",
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
});
