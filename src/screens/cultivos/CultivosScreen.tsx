"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from "react-native";
import { CultivoService } from "../../api/cultivoService";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";
import { Feather, MaterialIcons } from "../../components/Ionicons";
import { auth } from "../../firebase";
import ConfirmModal from "../../components/ConfirmModal"; // Asegúrate de crear este componente
import BottomNavBar from "../../components/BottomNavBar";
import { Ionicons } from '@expo/vector-icons';


type CultivosNav = NativeStackNavigationProp<RootStackParamList, "Cultivos">;

export default function CultivosScreen() {
  const [cultivos, setCultivos] = useState<any[]>([]);
  const [parcelas, setParcelas] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStage, setFilterStage] = useState("all");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCultivo, setSelectedCultivo] = useState<any>(null);
  const navigation = useNavigation<CultivosNav>();

  useEffect(() => {
    cargarParcelas();
    cargarCultivos();
  }, []);

  const cargarParcelas = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      const res = await fetch(
        "https://yara-91kd.onrender.com/parcelas/usuario",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setParcelas(Array.isArray(data) ? data : data.parcelas || []);
    } catch (err) {
      console.error("❌ Error cargando parcelas:", err);
    }
  };

  const cargarCultivos = async () => {
    try {
      const data = await CultivoService.obtenerTodosUsuario();
      setCultivos(data);
    } catch (err) {
      console.error("❌ Error cargando cultivos:", err);
    }
  };

  const handleActualizarCultivo = (cultivoActualizado: any) => {
    setCultivos((prev) =>
      prev.map((c) =>
        c._id === cultivoActualizado._id ? cultivoActualizado : c
      )
    );
  };

  const handleDeletePress = (cultivo: any) => {
    setSelectedCultivo(cultivo);
    setModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCultivo) return;
    try {
      await CultivoService.eliminar(selectedCultivo._id);
      setCultivos((prev) => prev.filter((c) => c._id !== selectedCultivo._id));
    } catch (err) {
      console.error(err);
    } finally {
      setModalVisible(false);
      setSelectedCultivo(null);
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage?.toLowerCase()) {
      case "siembra":
        return "#4BAE4F";
      case "germinación":
        return "#A7C97B";
      case "desarrollo vegetativo":
        return "#1E5631";
      case "crecimiento":
        return "#8FBC8F";
      case "floración":
        return "#FFB6C1";
      case "fructificación":
        return "#FF8C00";
      case "maduración":
        return "#DAA520";
      case "cosecha":
        return "#9F7928";
      case "postcosecha":
        return "#A9A9A9";
      default:
        return "#666";
    }
  };

  const getStageIcon = (stage: string) => {
    switch (stage?.toLowerCase()) {
      case "siembra":
        return "seedling";
      case "crecimiento":
        return "trending-up";
      case "floración":
        return "flower";
      case "cosecha":
        return "package";
      default:
        return "help-circle";
    }
  };

  const filteredCultivos = cultivos.filter((cultivo) => {
    const matchesSearch = cultivo.cultivo
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStage =
      filterStage === "all" ||
      cultivo.etapa?.toLowerCase() === filterStage.toLowerCase();
    return matchesSearch && matchesStage;
  });

  const activos = filteredCultivos.filter((c) => c.activo !== false);
  const inactivos = filteredCultivos.filter((c) => c.activo === false);

  const stages = [
    "all",
    "Siembra",
    "Germinación",
    "Desarrollo vegetativo",
    "Crecimiento",
    "Fructificación",
    "Maduración",
    "Floración",
    "Cosecha",
    "Post Cosecha",
  ];

  const getParcelaNombre = (parcelaId: string) => {
    const parcela = parcelas.find((p) => p._id === parcelaId);
    return parcela ? parcela.nombre : "N/A";
  };

  const renderCultivoCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.cropCard, item.activo === false && { opacity: 0.5 }]}
      onPress={() => navigation.navigate("DetallesCultivo", { id: item._id })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cropInfo}>
          <Text style={styles.cropName}>
            {String(item.cultivo ?? "Sin nombre")}
          </Text>
          <Text style={styles.cropPlot}>
            Parcela: {getParcelaNombre(item.parcelaId)}
          </Text>
        </View>
        <View
          style={[
            styles.stageBadge,
            { backgroundColor: getStageColor(item.etapa) },
          ]}
        >
          <Feather name={getStageIcon(item.etapa)} size={12} color="#FFFFFF" />
          <Text style={styles.stageText}>
            {String(item.etapa ?? "Desconocida")}
          </Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.infoLabel}>Inicio</Text>
            <Text style={styles.infoValue}>
              {item.fechaInicio
                ? new Date(item.fechaInicio).toLocaleDateString()
                : "N/A"}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="trending-up" size={16} color="#666" />
            <Text style={styles.infoLabel}>Rendimiento</Text>
            <Text style={styles.infoValue}>
              {item.rendimientoEsperado != null
                ? String(item.rendimientoEsperado)
                : "N/A"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() =>
            navigation.navigate("EditarCultivo", {
              id: item._id,
              onGoBack: handleActualizarCultivo,
            })
          }
        >
          <Feather name="edit-2" size={16} color="#4BAE4F" />
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeletePress(item)}
        >
          <Ionicons name="trash-outline" size={16} color="#FF4444" />
          <Text style={styles.deleteButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Mis Cultivos</Text>
          <Text style={styles.subtitle}>Gestiona y monitorea tus cultivos</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("CrearCultivo")}
        >
          <Feather name="plus" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Nuevo</Text>
        </TouchableOpacity>
      </View>

      {/* Search and Filters */}
      <View style={styles.filtersSection}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar cultivos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.stageFilters}
        >
          {stages.map((stage) => (
            <TouchableOpacity
              key={stage}
              style={[
                styles.stageFilter,
                filterStage === stage && styles.activeStageFilter,
              ]}
              onPress={() => setFilterStage(stage)}
            >
              <Text
                style={[
                  styles.stageFilterText,
                  filterStage === stage && styles.activeStageFilterText,
                ]}
              >
                {stage === "all"
                  ? "Todos"
                  : stage.charAt(0).toUpperCase() + stage.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Cultivos List */}
      <ScrollView
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Activos */}
        {activos.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Cultivos Activos</Text>
            {activos.map((item) => (
              <View key={item._id}>{renderCultivoCard({ item })}</View>
            ))}
          </>
        )}

        {/* Inactivos */}
        {inactivos.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Cultivos Inactivos</Text>
            {inactivos.map((item) => (
              <View key={item._id}>{renderCultivoCard({ item })}</View>
            ))}
          </>
        )}

        {/* Estado vacío */}
        {filteredCultivos.length === 0 && (
          <View style={styles.emptyState}>
            <Feather name="seedling" size={48} color="#A7C97B" />
            <Text style={styles.emptyTitle}>No hay cultivos</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? "No se encontraron cultivos con ese nombre"
                : "Comienza creando tu primer cultivo"}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Confirm Modal */}
      <ConfirmModal
        visible={modalVisible}
        title="Eliminar Cultivo"
        message={`¿Estás seguro de que deseas eliminar "${selectedCultivo?.cultivo}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setModalVisible(false)}
      />
      {/* Barra de navegación */}
      <BottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FFFE",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E5631",
    marginVertical: 10,
    marginLeft: 10,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1E5631",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4BAE4F",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: "#4BAE4F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
    marginLeft: 8,
  },
  filtersSection: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#333",
  },
  stageFilters: {
    flexDirection: "row",
  },
  stageFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
  },
  activeStageFilter: {
    backgroundColor: "#4BAE4F",
  },
  stageFilterText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  activeStageFilterText: {
    color: "#FFFFFF",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E5631",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  cropCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    paddingBottom: 16,
  },
  cropInfo: {
    flex: 1,
  },
  cropName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E5631",
    marginBottom: 4,
  },
  cropPlot: {
    fontSize: 14,
    color: "#666",
  },
  stageBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  stageText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  cardContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    gap: 20,
  },
  infoItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  cardActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  editButton: {
    borderRightWidth: 1,
    borderRightColor: "#F3F4F6",
  },
  deleteButton: {},
  editButtonText: {
    color: "#4BAE4F",
    fontWeight: "600",
    fontSize: 14,
  },
  deleteButtonText: {
    color: "#FF4444",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1E5631",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
});
