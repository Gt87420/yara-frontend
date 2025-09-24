"use client";

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import BottomNavBar from "../../components/BottomNavBar";
import { CultivoService } from "../../api/cultivoService";
import { InsumoService } from "../../api/insumoService";
import { auth } from "../../firebase";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const [cultivos, setCultivos] = useState<any[]>([]);
  const [insumos, setInsumos] = useState<any[]>([]);
  const [parcelas, setParcelas] = useState<any[]>([]);
  const navigation = useNavigation<any>();

  const SectionHeaderIcon = ({
    title,
    count,
    icon,
  }: {
    title: string;
    count: number;
    icon: React.ReactNode; // <-- Cambiado de string a React.ReactNode
  }) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleContainer}>
        <View style={styles.sectionIconContainer}>{icon}</View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{count}</Text>
      </View>
    </View>
  );

  const renderModernEmptyIcon = (message: string, icon: React.ReactNode) => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>{icon}</View>
      <Text style={styles.emptyText}>{message}</Text>
      <Text style={styles.emptySubtext}>
        Comienza agregando tu primer elemento
      </Text>
      <View style={styles.emptyAccent} />
    </View>
  );

  const StatsCardIcon = ({
    title,
    value,
    icon,
  }: {
    title: string;
    value: number;
    icon: React.ReactNode; // <-- aquí
  }) => (
    <View style={styles.statsCard}>
      <View style={styles.statsIconContainer}>{icon}</View>
      <Text style={styles.statsValue}>{value}</Text>
      <Text style={styles.statsTitle}>{title}</Text>
      <View style={styles.statsAccent} />
    </View>
  );

  const cargarCultivos = async () => {
    try {
      const data = await CultivoService.obtenerTodosUsuario();
      setCultivos(data);
    } catch (err) {
      console.error("❌ Error cargando cultivos:", err);
    }
  };

  const cargarInsumos = async () => {
    try {
      const data = await InsumoService.obtenerTodosUsuario();
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";

      // Obtener imágenes de cada insumo si no vienen
      const dataConImagen = await Promise.all(
        data.map(async (insumo: any) => {
          if (!insumo.imagen) {
            try {
              const res = await fetch(
                `https://yara-91kd.onrender.com/insumos/${insumo._id}/imagen`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              if (res.ok) {
                // Suponemos que el backend devuelve la imagen directamente o un redirect
                insumo.imagen =
                  res.url ||
                  `https://yara-91kd.onrender.com/insumos/${insumo._id}/imagen`;
              }
            } catch (err) {
              console.error("❌ Error cargando imagen de insumo:", err);
            }
          }
          return insumo;
        })
      );

      setInsumos(dataConImagen);
    } catch (err) {
      console.error("❌ Error cargando insumos:", err);
    }
  };

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

      if (Array.isArray(data)) setParcelas(data);
      else if (Array.isArray(data.parcelas)) setParcelas(data.parcelas);
      else setParcelas([]);
    } catch (err) {
      console.error("❌ Error cargando parcelas:", err);
      setParcelas([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarCultivos();
      cargarInsumos();
      cargarParcelas();
    }, [])
  );

  const formatArea = (hectareas: number) => {
    if (!hectareas) return "0 m²";
    if (hectareas >= 1) return `${hectareas.toFixed(2)} ha`;
    return `${(hectareas * 10000).toFixed(0)} m²`;
  };

  const StatsCard = ({
    title,
    value,
    icon,
  }: {
    title: string;
    value: number;
    icon: string;
  }) => (
    <View style={styles.statsCard}>
      <View style={styles.statsIconContainer}>
        <Text style={styles.statsIcon}>{icon}</Text>
      </View>
      <Text style={styles.statsValue}>{value}</Text>
      <Text style={styles.statsTitle}>{title}</Text>
      <View style={styles.statsAccent} />
    </View>
  );

  const renderModernCard =
    (
      titleKey: string,
      detailKey: string,
      type: "cultivo" | "insumo" | "parcela"
    ) =>
    ({ item }: any) => {
      const getStatusColor = () => {
        if (type === "cultivo") {
          const etapa = item[detailKey]?.toLowerCase();
          if (etapa?.includes("germinación")) return "#A7C97B";
          if (etapa?.includes("crecimiento")) return "#4BAE4F";
          if (etapa?.includes("floración")) return "#1E5631";
          return "#A7C97B";
        }
        if (type === "insumo") {
          const cantidad = Number.parseInt(item[detailKey]);
          if (cantidad > 50) return "#4BAE4F";
          if (cantidad > 20) return "#A7C97B";
          return "#FF6B6B";
        }
        return "#4BAE4F";
      };

      const imageUri =
        item.imagen && item.imagen.length > 0
          ? item.imagen.startsWith("http")
            ? item.imagen
            : `https://yara-91kd.onrender.com${item.imagen}`
          : null;

      return (
        <TouchableOpacity
          style={[styles.modernCard]}
          onPress={() => {
            if (type === "cultivo")
              navigation.navigate("DetallesCultivo", { id: item._id });
            if (type === "insumo")
              navigation.navigate("InsumoDetail", { id: item._id });
            if (type === "parcela")
              navigation.navigate("DetallesParcelaScreen", { id: item._id });
          }}
        >
          <View style={styles.cardGradientOverlay} />
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.cardIconContainer,
                { backgroundColor: getStatusColor() + "20" },
              ]}
            >
              {type === "cultivo" || type === "insumo" ? (
                <Image
                  source={{ uri: item.img || item.imagen }} // <-- aquí estaba 'imagen'
                  style={{ width: 48, height: 48, borderRadius: 12 }}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.cardIcon}>🏞️</Text>
              )}
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item[titleKey]}
              </Text>
              {detailKey && (
                <Text style={styles.cardDetail}>
                  {detailKey === "areaHectareas"
                    ? formatArea(item[detailKey])
                    : item[detailKey]}
                </Text>
              )}
            </View>
          </View>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: getStatusColor() },
            ]}
          />
          <View
            style={[styles.cardAccent, { backgroundColor: getStatusColor() }]}
          />
        </TouchableOpacity>
      );
    };

  const renderModernEmpty = (message: string, icon: string) => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Text style={styles.emptyIcon}>{icon}</Text>
      </View>
      <Text style={styles.emptyText}>{message}</Text>
      <Text style={styles.emptySubtext}>
        Comienza agregando tu primer elemento
      </Text>
      <View style={styles.emptyAccent} />
    </View>
  );

  const SectionHeader = ({
    title,
    count,
    icon,
  }: {
    title: string;
    count: number;
    icon: string;
  }) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleContainer}>
        <View style={styles.sectionIconContainer}>
          <Text style={styles.sectionIcon}>{icon}</Text>
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{count}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.headerGradient} />
          <Text style={styles.welcomeText}>Bienvenido a</Text>

          {/* Logo en vez del texto */}
          <Image
            source={require("../../../assets/img/LOGOYARABLANCO.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.subtitle}>
            Gestiona tu agricultura de manera inteligente
          </Text>
          <View style={styles.headerDecoration} />
        </View>

        <View style={styles.heroSection}>
          <StatsCardIcon
            title="Cultivos"
            value={cultivos.length}
            icon={<Ionicons name="leaf" size={24} color="#15803d" />}
          />
          <StatsCardIcon
            title="Insumos"
            value={insumos.length}
            icon={<Ionicons name="cube-outline" size={24} color="#15803d" />}
          />
          <StatsCardIcon
            title="Parcelas"
            value={parcelas.length}
            icon={<Ionicons name="map" size={24} color="#15803d" />}
          />
        </View>

        <View style={styles.section}>
          <SectionHeaderIcon
            title="Cultivos Activos"
            count={cultivos.length}
            icon={<Ionicons name="leaf" size={24} color="#F1FDFD" />}
          />
          <FlatList
            data={cultivos}
            keyExtractor={(item) => item._id}
            renderItem={renderModernCard("cultivo", "etapa", "cultivo")}
            ListEmptyComponent={renderModernEmptyIcon(
              "No tienes cultivos activos",
              <Ionicons name="leaf" size={48} color="#A7C97B" />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        <View style={styles.section}>
          <SectionHeaderIcon
            title="Inventario de Insumos"
            count={insumos.length}
            icon={<Ionicons name="cube-outline" size={24} color="#F1FDFD" />}
          />
          <FlatList
            data={insumos}
            keyExtractor={(item) => item._id}
            renderItem={renderModernCard("nombre", "cantidad", "insumo")}
            ListEmptyComponent={renderModernEmptyIcon(
              "No tienes insumos registrados",
              <Ionicons name="cube-outline" size={48} color="#A7C97B" />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        <View style={styles.section}>
          <SectionHeaderIcon
            title="Mis Parcelas"
            count={parcelas.length}
            icon={<Ionicons name="map" size={24} color="#F1FDFD" />}
          />
          <FlatList
            data={parcelas}
            keyExtractor={(item) => item._id}
            renderItem={renderModernCard("nombre", "areaHectareas", "parcela")}
            ListEmptyComponent={renderModernEmptyIcon(
              "No tienes parcelas registradas",
              <Ionicons name="map-outline" size={48} color="#A7C97B" />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>
      </ScrollView>

      <BottomNavBar />
    </View>
  );
}
const styles = StyleSheet.create({
  logo: {
    width: 120, // ajusta según necesites
    height: 80, // ajusta según necesites
    alignSelf: "center",
    marginVertical: 8,
  },
  container: {
    flex: 1,
    backgroundColor: "#F1FDFD",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    backgroundColor: "#1E5631",
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: "relative",
    overflow: "hidden",
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(75, 174, 79, 0.1)",
  },
  headerDecoration: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(167, 201, 123, 0.1)",
  },
  welcomeText: {
    fontSize: 18,
    color: "#F1FDFD",
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  appTitle: {
    fontSize: 42,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    marginVertical: 8,
    letterSpacing: 3,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#E8EAE6",
    textAlign: "center",
    opacity: 0.9,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  heroSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 35,
  },
  statsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 6,
    shadowColor: "#1E5631",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 0.5,
    borderColor: "#E8EAE6",
    position: "relative",
    overflow: "hidden",
  },
  statsIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F1FDFD",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#A7C97B",
  },
  statsIcon: {
    fontSize: 26,
  },
  statsValue: {
    fontSize: 28,
    fontWeight: "900",
    color: "#1E5631",
    marginBottom: 6,
  },
  statsTitle: {
    fontSize: 13,
    color: "#2C3E50",
    fontWeight: "600",
    textAlign: "center",
  },
  statsAccent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "#4BAE4F",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  section: {
    marginBottom: 35,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 18,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4BAE4F",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#4BAE4F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sectionIcon: {
    fontSize: 20,
    filter: "brightness(1.2)",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1E5631",
    letterSpacing: 0.3,
  },
  countBadge: {
    backgroundColor: "#4BAE4F",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 32,
    alignItems: "center",
    shadowColor: "#4BAE4F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  countText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  horizontalList: {
    paddingHorizontal: 20,
  },
  modernCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginRight: 16,
    width: width * 0.72,
    shadowColor: "#1E5631",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 0.5,
    borderColor: "#E8EAE6",
    position: "relative",
    overflow: "hidden",
  },
  cardGradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "30%",
    backgroundColor: "rgba(241, 253, 253, 0.8)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1,
  },
  cardIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#F1FDFD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 2,
    borderColor: "#A7C97B",
  },
  cardIcon: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E5631",
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  cardDetail: {
    fontSize: 15,
    color: "#2C3E50",
    fontWeight: "600",
    opacity: 0.8,
  },
  statusIndicator: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  cardAccent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 5,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    paddingHorizontal: 30,
    width: width * 0.8,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginHorizontal: 10,
    borderWidth: 2,
    borderColor: "#E8EAE6",
    borderStyle: "dashed",
    position: "relative",
    overflow: "hidden",
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F1FDFD",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "#A7C97B",
  },
  emptyIcon: {
    fontSize: 40,
    opacity: 0.7,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E5631",
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  emptySubtext: {
    fontSize: 15,
    color: "#2C3E50",
    textAlign: "center",
    opacity: 0.7,
    fontWeight: "500",
  },
  emptyAccent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "#A7C97B",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
});
