import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from "react-native";
import actividadService from "../../api/actividadService";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { auth } from "../../firebase";
import { Feather, MaterialIcons, Ionicons } from "@expo/vector-icons";
import BottomNavBar from "../../components/BottomNavBar";

const ActividadesList = () => {
  const [actividades, setActividades] = useState<any[]>([]);
  const [parcelas, setParcelas] = useState<any[]>([]);
  const [cultivos, setCultivos] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const navigation = useNavigation<any>();

  useFocusEffect(
    useCallback(() => {
      const fetchAll = async () => {
        await Promise.all([
          fetchActividades(),
          fetchParcelas(),
          fetchCultivos(),
        ]);
      };
      fetchAll();
    }, [])
  );

  const fetchActividades = async () => {
    try {
      const data = await actividadService.getAll();
      setActividades(data);
    } catch (e) {
      console.error("❌ Error cargando actividades:", e);
    }
  };

  const fetchParcelas = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      const res = await fetch(
        "https://yara-91kd.onrender.com/parcelas/usuario",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setParcelas(Array.isArray(data) ? data : data.parcelas || []);
    } catch (err) {
      console.error("❌ Error cargando parcelas:", err);
    }
  };

  const fetchCultivos = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      const res = await fetch("https://yara-91kd.onrender.com/cultivos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCultivos(Array.isArray(data) ? data : data.cultivos || []);
    } catch (err) {
      console.error("❌ Error cargando cultivos:", err);
    }
  };

  const getParcelaNombre = (parcela: any) => {
    if (!parcela) return "No encontrada";
    if (typeof parcela === "object") return parcela.nombre || "Sin nombre";
    const p = parcelas.find((x) => x._id === parcela || x.id === parcela);
    return p ? p.nombre || "Sin nombre" : "No encontrada";
  };

  const getCultivoNombre = (cultivo: any) => {
    if (!cultivo) return "No encontrado";
    if (typeof cultivo === "object")
      return cultivo.cultivo || cultivo.nombre || "Sin nombre";
    const c = cultivos.find((x) => x._id === cultivo || x.id === cultivo);
    return c ? c.cultivo || c.nombre || "Sin nombre" : "No encontrado";
  };

  const getStatusColor = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case "pendiente":
        return "#A7C97B";
      case "completada":
        return "#4BAE4F";
      case "cancelada":
        return "#999999";
      case "en progreso":
        return "#1E5631";
      default:
        return "#666666";
    }
  };

  const getActivityIcon = (tipo: string) => {
    const tipoLower = tipo?.toLowerCase() || "";
    if (tipoLower.includes("riego")) return "activity"; // reemplazo de "water"
    if (tipoLower.includes("fertiliz")) return "archive"; // reemplazo de "leaf"
    if (tipoLower.includes("cosecha")) return "package";
    if (tipoLower.includes("siembra")) return "clipboard"; // reemplazo de "seedling"
    if (tipoLower.includes("poda")) return "scissors";
    if (tipoLower.includes("control")) return "shield";
    return "clipboard";
  };

  const getStatusIcon = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case "pendiente":
        return "clock";
      case "completada":
        return "check-circle";
      case "cancelada":
        return "x-circle";
      case "en progreso":
        return "activity";
      default:
        return "help-circle";
    }
  };

  const filteredActividades = actividades.filter((actividad) => {
    const matchesSearch = actividad.tipoActividad
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      actividad.estado?.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const pendientes = filteredActividades.filter(
    (a) => a.estado === "pendiente"
  );
  const completadas = filteredActividades.filter(
    (a) => a.estado === "completada"
  );
  const canceladas = filteredActividades.filter(
    (a) => a.estado === "cancelada"
  );

  const renderActivityCard = ({ item }: any) => (
    <TouchableOpacity
      style={styles.activityCard}
      onPress={() => navigation.navigate("ActividadDetail", { id: item._id })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.activityIconContainer}>
          <View
            style={[
              styles.activityIconCircle,
              { backgroundColor: `${getStatusColor(item.estado)}20` },
            ]}
          >
            <Feather
              name={getActivityIcon(item.tipoActividad)}
              size={20}
              color={getStatusColor(item.estado)}
            />
          </View>
        </View>

        <View style={styles.activityInfo}>
          <Text style={styles.activityTitle}>{item.tipoActividad}</Text>
          <View style={styles.activityMeta}>
            <Ionicons name="calendar-outline" size={14} color="#666" />
            <Text style={styles.activityDate}>
              {new Date(item.fechaProgramada).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.estado) },
          ]}
        >
          <Feather
            name={getStatusIcon(item.estado)}
            size={12}
            color="#FFFFFF"
          />
          <Text style={styles.statusText}>{item.estado}</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Feather name="map-pin" size={14} color="#1E5631" />
            <Text style={styles.detailLabel}>Parcela:</Text>
            <Text style={styles.detailValue}>
              {getParcelaNombre(item.parcelaId)}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="leaf" size={16} color="#15803d" />
            <Text style={styles.detailLabel}>Cultivo:</Text>
            <Text style={styles.detailValue}>
              {getCultivoNombre(item.cultivoId)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const statuses = ["all", "pendiente", "completada", "cancelada"];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Mis Actividades</Text>
          <Text style={styles.subtitle}>Gestiona tus tareas agrícolas</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("ActividadCreate")}
        >
          <Feather name="plus" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Nueva</Text>
        </TouchableOpacity>
      </View>

      {/* Search and Filters */}
      <View style={styles.filtersSection}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar actividades..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statusFilters}
        >
          {statuses.map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusFilter,
                filterStatus === status && styles.activeStatusFilter,
              ]}
              onPress={() => setFilterStatus(status)}
            >
              <Text
                style={[
                  styles.statusFilterText,
                  filterStatus === status && styles.activeStatusFilterText,
                ]}
              >
                {status === "all"
                  ? "Todas"
                  : status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: "#FFF6E7" }]}>
          <Text style={[styles.statNumber, { color: "#A7C97B" }]}>
            {pendientes.length}
          </Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#E8F5E9" }]}>
          <Text style={[styles.statNumber, { color: "#4BAE4F" }]}>
            {completadas.length}
          </Text>
          <Text style={styles.statLabel}>Completadas</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#F5F5F5" }]}>
          <Text style={[styles.statNumber, { color: "#999" }]}>
            {canceladas.length}
          </Text>
          <Text style={styles.statLabel}>Canceladas</Text>
        </View>
      </View>

      {/* Activities List */}
      <ScrollView
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Pendientes */}
        {pendientes.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Feather name="clock" size={18} color="#A7C97B" />
              <Text style={styles.sectionTitle}>Pendientes</Text>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>{pendientes.length}</Text>
              </View>
            </View>
            {pendientes.map((item) => (
              <View key={item._id}>{renderActivityCard({ item })}</View>
            ))}
          </>
        )}

        {/* Completadas */}
        {completadas.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Feather name="check-circle" size={18} color="#4BAE4F" />
              <Text style={styles.sectionTitle}>Completadas</Text>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>
                  {completadas.length}
                </Text>
              </View>
            </View>
            {completadas.map((item) => (
              <View key={item._id}>{renderActivityCard({ item })}</View>
            ))}
          </>
        )}

        {/* Canceladas */}
        {canceladas.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Feather name="x-circle" size={18} color="#999" />
              <Text style={styles.sectionTitle}>Canceladas</Text>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>{canceladas.length}</Text>
              </View>
            </View>
            {canceladas.map((item) => (
              <View key={item._id}>{renderActivityCard({ item })}</View>
            ))}
          </>
        )}

        {/* Empty State */}
        {filteredActividades.length === 0 && (
          <View style={styles.emptyState}>
            <Feather name="clipboard" size={48} color="#A7C97B" />
            <Text style={styles.emptyTitle}>No hay actividades</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? "No se encontraron actividades con ese nombre"
                : "Comienza creando tu primera actividad"}
            </Text>
          </View>
        )}
      </ScrollView>
      {/* Bottom Navigation Bar */}
      <BottomNavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FFFE",
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
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  statusFilters: {
    flexDirection: "row",
  },
  statusFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
  },
  activeStatusFilter: {
    backgroundColor: "#4BAE4F",
  },
  statusFilterText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  activeStatusFilterText: {
    color: "#FFFFFF",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E5631",
  },
  sectionBadge: {
    backgroundColor: "#E8EAE6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E5631",
  },
  activityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingBottom: 12,
  },
  activityIconContainer: {
    marginRight: 12,
  },
  activityIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E5631",
    marginBottom: 4,
  },
  activityMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  activityDate: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
  },
  detailItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailLabel: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#1E5631",
    fontWeight: "600",
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

export default ActividadesList;
