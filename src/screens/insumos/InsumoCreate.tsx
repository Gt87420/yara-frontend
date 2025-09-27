"use client";

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { InsumoService } from "../../api/insumoService";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../../firebase";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { showMessage } from "react-native-flash-message";

const InsumoCreate = () => {
  const [nombre, setNombre] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [unidad, setUnidad] = useState("");
  const [precioUnitario, setPrecioUnitario] = useState("");
  const [fechaIngreso, setFechaIngreso] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [imagen, setImagen] = useState<string>("");
  const [preview, setPreview] = useState<string>("");

  const [loading, setLoading] = useState(false);

  const [showIngresoPicker, setShowIngresoPicker] = useState(false);
  const [showVencimientoPicker, setShowVencimientoPicker] = useState(false);

  const navigation = useNavigation<any>();

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0]; // YYYY-MM-DD
  };

  const pickImage = async () => {
    Alert.alert(
      "Seleccionar imagen",
      "¿Deseas tomar una foto o elegir de la galería?",
      [
        {
          text: "Cámara",
          onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.7,
              allowsEditing: false, // sin recorte
            });
            if (!result.canceled) {
              setImagen(result.assets[0].uri);
              setPreview(result.assets[0].uri);
            }
          },
        },
        {
          text: "Galería",
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.7,
              allowsEditing: false, // sin recorte
            });
            if (!result.canceled) {
              setImagen(result.assets[0].uri);
              setPreview(result.assets[0].uri);
            }
          },
        },
        { text: "Cancelar", style: "cancel" },
      ]
    );
  };

  const handleCreate = async () => {
    if (!nombre || !cantidad || !unidad || !precioUnitario || !fechaIngreso) {
      Alert.alert("Error", "Por favor completa todos los campos obligatorios");
      return;
    }

    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "No se encontró el usuario autenticado");
        setLoading(false);
        return;
      }

      // 🔹 Convertir strings a fechas válidas
      const fechaIngresoDate = new Date(fechaIngreso);
      const fechaVencimientoDate = fechaVencimiento
        ? new Date(fechaVencimiento)
        : null;

      // 🔹 Crear el insumo con los tipos correctos
      const newInsumo = await InsumoService.crear({
        usuarioUid: user.uid, // ✅ string
        nombre,
        cantidad: Number(cantidad),
        unidad,
        precioUnitario: Number(precioUnitario),
        fechaIngreso: new Date(fechaIngresoDate), // ✅ objeto Date
        fechaVencimiento: fechaVencimientoDate
          ? new Date(fechaVencimientoDate)
          : undefined, // opcional
      });

      // 🔹 Subir imagen si existe
      if (imagen && newInsumo?._id) {
        const token = await user.getIdToken();

        const formData = new FormData();
        formData.append("file", {
          uri: imagen,
          name: "insumo.jpg",
          type: "image/jpeg",
        } as any);

        await fetch(
          `https://yara-91kd.onrender.com/insumos/${newInsumo._id}/imagen`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          }
        );
      }

      showMessage({
        message: "Éxito",
        description: "Insumo creado correctamente",
        type: "success",
        icon: "success",
        duration: 2000,
        position: "top",
      });

      // 🔹 Limpiar campos
      setNombre("");
      setCantidad("");
      setUnidad("");
      setPrecioUnitario("");
      setFechaIngreso("");
      setFechaVencimiento("");
      setImagen("");
      setPreview("");

      navigation.goBack();
    } catch (error) {
      console.error("❌ Error al crear insumo:", error);
      showMessage({
        message: "Error",
        description: "No se pudo crear el insumo",
        type: "danger",
        icon: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear Insumo</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Información Básica */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Text style={styles.sectionIconText}>📝</Text>
            </View>
            <Text style={styles.sectionTitle}>Información Básica</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre del Insumo *</Text>
            <TextInput
              style={styles.input}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ej: Semillas de Maíz"
              placeholderTextColor="#A7C97B"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Cantidad *</Text>
              <TextInput
                style={styles.input}
                value={cantidad}
                onChangeText={setCantidad}
                keyboardType="numeric"
                placeholder="100"
                placeholderTextColor="#A7C97B"
              />
            </View>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Unidad *</Text>
              <TextInput
                style={styles.input}
                value={unidad}
                onChangeText={setUnidad}
                placeholder="kg, lt, pcs, lbs"
                placeholderTextColor="#A7C97B"
              />
            </View>
          </View>
        </View>

        {/* Información de Precios */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Text style={styles.sectionIconText}>💰</Text>
            </View>
            <Text style={styles.sectionTitle}>Información de Precios</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Precio Unitario *</Text>
            <TextInput
              style={styles.input}
              value={precioUnitario}
              onChangeText={setPrecioUnitario}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor="#A7C97B"
            />
          </View>
        </View>

        {/* Fechas */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Text style={styles.sectionIconText}>📅</Text>
            </View>
            <Text style={styles.sectionTitle}>Fechas Importantes</Text>
          </View>

          {/* Fecha de Ingreso */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Fecha de Ingreso *</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowIngresoPicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {fechaIngreso || "YYYY-MM-DD"}
              </Text>
            </TouchableOpacity>
            {showIngresoPicker && (
              <DateTimePicker
                value={fechaIngreso ? new Date(fechaIngreso) : new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                themeVariant={Platform.OS === "android" ? "dark" : undefined} // modo oscuro Android
                onChange={(event, selectedDate) => {
                  setShowIngresoPicker(Platform.OS === "ios");
                  if (selectedDate) setFechaIngreso(formatDate(selectedDate));
                }}
                textColor="#1E5631"
              />
            )}
          </View>

          {/* Fecha de Vencimiento */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Fecha de Vencimiento *</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowVencimientoPicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {fechaVencimiento || "YYYY-MM-DD"}
              </Text>
            </TouchableOpacity>
            {showVencimientoPicker && (
              <DateTimePicker
                value={
                  fechaVencimiento ? new Date(fechaVencimiento) : new Date()
                }
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                themeVariant={Platform.OS === "android" ? "dark" : undefined}
                onChange={(event, selectedDate) => {
                  setShowVencimientoPicker(Platform.OS === "ios");
                  if (selectedDate)
                    setFechaVencimiento(formatDate(selectedDate));
                }}
                textColor="#1E5631"
              />
            )}
          </View>
        </View>

        {/* Imagen */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Text style={styles.sectionIconText}>📸</Text>
            </View>
            <Text style={styles.sectionTitle}>Imagen del Insumo</Text>
          </View>

          {preview ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: preview }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => {
                  setImagen("");
                  setPreview("");
                }}
              >
                <Text style={styles.removeImageText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                <View style={styles.uploadContent}>
                  <Text style={styles.uploadIcon}>📁</Text>
                  <Text style={styles.uploadText}>Seleccionar Imagen</Text>
                  <Text style={styles.uploadSubtext}>
                    Toca para subir una foto desde la galería
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Nuevo botón para abrir cámara */}
              <TouchableOpacity
                style={styles.uploadButton} // puedes usar mismo estilo o crear uno nuevo
                onPress={async () => {
                  const result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    quality: 0.7,
                  });
                  if (!result.canceled) {
                    setImagen(result.assets[0].uri);
                    setPreview(result.assets[0].uri);
                  }
                }}
              >
                <View style={styles.uploadContent}>
                  <Text style={styles.uploadIcon}>📷</Text>
                  <Text style={styles.uploadText}>Tomar Foto</Text>
                  <Text style={styles.uploadSubtext}>
                    Toca para capturar una foto con la cámara
                  </Text>
                </View>
              </TouchableOpacity>
            </>
          )}

          {preview && (
            <TouchableOpacity
              style={styles.changeImageButton}
              onPress={pickImage}
            >
              <Text style={styles.changeImageText}>Cambiar Imagen</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Botón de Crear */}
        <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
          <Text style={styles.createButtonText}>✓ Crear Insumo</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4BAE4F" />
          <Text style={styles.loadingText}>Creando insumo...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1FDFD",
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
  dateButton: {
    backgroundColor: "#F5F5F5",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: "#1E5631",
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
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: {
    width: "48%",
  },
  imageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  removeImageText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "bold",
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: "#A7C97B",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
    backgroundColor: "#F8FDF9",
  },
  uploadContent: {
    alignItems: "center",
  },
  uploadIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4BAE4F",
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 14,
    color: "#A7C97B",
  },
  changeImageButton: {
    backgroundColor: "#A7C97B",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 12,
  },
  changeImageText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
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
});

export default InsumoCreate;
