"use client";

import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  StatusBar,
  Dimensions,
} from "react-native";
import {
  useRoute,
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
import { InsumoService } from "../../api/insumoService";
import { showMessage } from "react-native-flash-message";
import { Ionicons } from "@expo/vector-icons";


const { width } = Dimensions.get("window");

const InsumoDetail = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { id } = route.params;
  const [insumo, setInsumo] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        const data = await InsumoService.obtenerPorId(id);
        setInsumo(data);
      };
      fetchData();
    }, [id])
  );

  const handleDelete = () => {
    if (!insumo) {
      showMessage({
        message: "Error",
        description: "⚠️ No se pudo cargar la información del insumo",
        type: "warning",
        duration: 3000,
        position: "top",
        floating: true,
      });
      return;
    }

    Alert.alert(
      "Confirmar eliminación",
      "¿Estás seguro de que quieres eliminar este insumo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await InsumoService.eliminar(id);
              showMessage({
                message: "✅ Insumo eliminado",
                description: "El insumo se eliminó correctamente",
                type: "success",
                duration: 2000,
                position: "top",
                floating: true,
                style: { borderRadius: 16, marginTop: 40, marginHorizontal: 16, padding: 10  }, 
              });
              navigation.goBack();
            } catch (error) {
              showMessage({
                message: "❌ Error al eliminar",
                description: "No se pudo eliminar el insumo",
                type: "danger",
                duration: 3000,
                position: "top",
                floating: true,
              });
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-NI", {
      style: "currency",
      currency: "NIO",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStockStatus = (cantidad: number) => {
    if (cantidad === 0)
      return { text: "Sin stock", color: "#d32f2f", bg: "#ffebee" };
    if (cantidad < 10)
      return { text: "Stock bajo", color: "#f57c00", bg: "#fff3e0" };
    return { text: "En stock", color: "#4BAE4F", bg: "#e8f5e8" };
  };

  if (!insumo) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingText}>⏳ Cargando...</Text>
        </View>
      </View>
    );
  }

  const stockStatus = getStockStatus(insumo.cantidad);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E5631" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
         <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle del Insumo</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Card */}
        <View style={styles.imageCard}>
          {insumo.img ? (
            <Image source={{ uri: insumo.img }} style={styles.productImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderIcon}>📦</Text>
              <Text style={styles.placeholderText}>Sin imagen</Text>
            </View>
          )}

          {/* Stock Status Badge */}
          <View
            style={[styles.stockBadge, { backgroundColor: stockStatus.bg }]}
          >
            <Text style={[styles.stockText, { color: stockStatus.color }]}>
              {stockStatus.text}
            </Text>
          </View>
        </View>

        {/* Product Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.productName}>{insumo.nombre}</Text>

          <View style={styles.quantityContainer}>
            <View style={styles.quantityBadge}>
              <Text style={styles.quantityNumber}>{insumo.cantidad}</Text>
              <Text style={styles.quantityUnit}>{insumo.unidad}</Text>
            </View>
          </View>
        </View>

        {/* Details Grid */}
        <View style={styles.detailsGrid}>
          {/* Price Card */}
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailIcon}>💰</Text>
              <Text style={styles.detailLabel}>Precio Unitario</Text>
            </View>
            <Text style={styles.detailValue}>
              {formatCurrency(insumo.precioUnitario)}
            </Text>
          </View>

          {/* Total Value Card */}
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailIcon}>💎</Text>
              <Text style={styles.detailLabel}>Valor Total</Text>
            </View>
            <Text style={styles.detailValue}>
              {formatCurrency(insumo.precioUnitario * insumo.cantidad)}
            </Text>
          </View>
        </View>

        {/* Dates Section */}
        <View style={styles.datesSection}>
          <Text style={styles.sectionTitle}>📅 Fechas Importantes</Text>

          <View style={styles.dateCard}>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Fecha de Ingreso</Text>
              <Text style={styles.dateValue}>
                {formatDate(insumo.fechaIngreso)}
              </Text>
            </View>

            {/* Divider con más espacio */}
            <View style={styles.dateDivider} />

            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Fecha de Vencimiento</Text>
              <Text style={styles.dateValue}>
                {formatDate(insumo.fechaVencimiento)}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate("InsumoEdit", { id })}
          >
            <Text style={styles.editIcon}>✏️</Text>
            <Text style={styles.editButtonText}>Editar Insumo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteIcon}>🗑️</Text>
            <Text style={styles.deleteButtonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1FDFD",
  },
  dateCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 20, // más espacio arriba y abajo
    paddingHorizontal: 24, // más espacio a los lados
    shadowColor: "#1E5631",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12, // aumenta espacio entre filas
    gap: 8, // espacio entre texto y valor
  },
  dateDivider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 12, // más espacio arriba y abajo del divider
  },
  dateLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    flexShrink: 1, // permite que el texto se ajuste si es largo
  },
  dateValue: {
    fontSize: 14,
    color: "#1E5631",
    fontWeight: "700",
    textAlign: "right",
    marginLeft: 12, // agrega separación entre label y valor si se necesita
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fffe",
  },
  loadingCard: {
    backgroundColor: "#FFFFFF",
    padding: 32,
    borderRadius: 20,
    shadowColor: "#1E5631",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingText: {
    fontSize: 18,
    color: "#1E5631",
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E5631",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "bold",
    lineHeight: 20, // asegura que el texto se centre verticalmente
    textAlign: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  imageCard: {
    margin: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#1E5631",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: 240,
    resizeMode: "cover",
  },
  placeholderImage: {
    width: "100%",
    height: 240,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  stockBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  stockText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  infoCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#1E5631",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  productName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1E5631",
    marginBottom: 16,
    textAlign: "center",
  },
  quantityContainer: {
    alignItems: "center",
  },
  quantityBadge: {
    backgroundColor: "#4BAE4F",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "baseline",
  },
  quantityNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    marginRight: 8,
  },
  quantityUnit: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    opacity: 0.9,
  },
  detailsGrid: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  detailCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#1E5631",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E5631",
  },
  datesSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E5631",
    marginBottom: 12,
  },
  actionsContainer: {
    marginHorizontal: 20,
    gap: 12,
  },
  editButton: {
    backgroundColor: "#4BAE4F",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#4BAE4F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  editIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  deleteButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#d32f2f",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
  },
  deleteIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  deleteButtonText: {
    color: "#d32f2f",
    fontSize: 16,
    fontWeight: "700",
  },
  bottomSpacer: {
    height: 40,
  },
});

export default InsumoDetail;
