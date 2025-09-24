"use client";

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  StatusBar,
  Dimensions,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { InsumoService } from "../../api/insumoService";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomNavBar from "../../components/BottomNavBar";

const { width } = Dimensions.get("window");

type Insumo = {
  _id: string;
  nombre: string;
  cantidad: number;
  unidad: string;
  img?: string;
};

const InsumosList = () => {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredInsumos, setFilteredInsumos] = useState<Insumo[]>([]);
  const navigation = useNavigation<any>();

  const fetchInsumos = async () => {
    try {
      const data = await InsumoService.obtenerTodosUsuario();
      setInsumos(data);
      setFilteredInsumos(data);
    } catch (error) {
      console.error("Error al cargar insumos:", error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredInsumos(insumos);
    } else {
      const filtered = insumos.filter((insumo) =>
        insumo.nombre.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredInsumos(filtered);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchInsumos();
    }, [])
  );

  const renderItem = ({ item, index }: { item: Insumo; index: number }) => (
    <TouchableOpacity
      style={[styles.card, { marginTop: index === 0 ? 0 : 16 }]}
      onPress={() => navigation.navigate("InsumoDetail", { id: item._id })}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          {item.img ? (
            <Image
              source={{ uri: item.img }}
              style={{ width: 40, height: 40, borderRadius: 8 }}
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="cube-outline" size={24} color="#FFFFFF" />
          )}
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.itemName}>{item.nombre}</Text>
          <View style={styles.quantityContainer}>
            <Ionicons name="analytics-outline" size={16} color="#A7C97B" />
            <Text style={styles.quantity}>
              {item.cantidad} {item.unidad}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="chevron-forward" size={20} color="#A7C97B" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: item.cantidad > 10 ? "#4BAE4F" : "#FF6B6B" },
            ]}
          />
          <Text style={styles.statusText}>
            {item.cantidad > 10 ? "En stock" : "Stock bajo"}
          </Text>
        </View>
        <Text style={styles.lastUpdated}>Actualizado hoy</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="cube-outline" size={64} color="#A7C97B" />
      </View>
      <Text style={styles.emptyTitle}>No hay insumos</Text>
      <Text style={styles.emptySubtitle}>
        Comienza agregando tu primer insumo para gestionar tu inventario
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E5631" />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Mis Insumos</Text>
            <Text style={styles.headerSubtitle}>
              {filteredInsumos.length}{" "}
              {filteredInsumos.length === 1 ? "insumo" : "insumos"}
            </Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle-outline" size={32} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#A7C97B"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar insumos..."
            placeholderTextColor="#F1FDFD"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => handleSearch("")}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#A7C97B" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <FlatList
          data={filteredInsumos}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("InsumoCreate")}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
        <BottomNavBar />
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1FDFD",
  },
  header: {
    backgroundColor: "#1E5631",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#F1FDFD",
  },
  profileButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(167, 201, 123, 0.1)",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: "rgba(167, 201, 123, 0.2)",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#FFFFFF",
  },
  clearButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingTop: 24,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(167, 201, 123, 0.1)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#4BAE4F",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E5631",
    marginBottom: 6,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantity: {
    fontSize: 14,
    color: "#A7C97B",
    marginLeft: 6,
    fontWeight: "600",
  },
  moreButton: {
    padding: 8,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(167, 201, 123, 0.1)",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E5631",
  },
  lastUpdated: {
    fontSize: 12,
    color: "#A7C97B",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(167, 201, 123, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E5631",
    marginBottom: 12,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#A7C97B",
    textAlign: "center",
    lineHeight: 24,
  },
  fab: {
    position: "absolute",
    bottom: 100,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#4BAE4F",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4BAE4F",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
});

export default InsumosList;
