"use client";

import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { InsumoService } from "../../api/insumoService";
import { auth } from "../../firebase";
import { Ionicons } from "@expo/vector-icons";
import { showMessage } from "react-native-flash-message";

const formatDate = (isoString: string) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const { width } = Dimensions.get("window");

const InsumoEdit = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { id } = route.params;

  const [insumo, setInsumo] = useState<any>(null);
  const [imagen, setImagen] = useState<string>("");
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const data = await InsumoService.obtenerPorId(id);
      setInsumo(data);
    };
    fetchData();
  }, [id]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      setImagen(result.assets[0].uri);
      setPreview(result.assets[0].uri);
    }
  };

  const handleUpdate = async () => {
    if (!insumo.nombre || !insumo.cantidad || !insumo.unidad) {
      showMessage({
        message: "Error",
        description: "Los campos obligatorios no pueden estar vacíos",
        type: "danger",
        duration: 2000,
      });
      return;
    }

    setLoading(true);
    try {
      // Crear un objeto solo con los campos editables
      const dataToUpdate = {
        nombre: insumo.nombre,
        cantidad: insumo.cantidad,
        unidad: insumo.unidad,
        precioUnitario: insumo.precioUnitario,
        fechaIngreso: insumo.fechaIngreso,
        fechaVencimiento: insumo.fechaVencimiento,
        // si hay más campos editables, añadirlos aquí
      };

      console.log("Datos que se envían:", dataToUpdate);

      await InsumoService.editar(id, dataToUpdate);

      if (imagen) {
        const user = auth.currentUser;
        if (!user) return;
        const token = await user.getIdToken();

        const formData = new FormData();
        formData.append("file", {
          uri: imagen,
          name: "insumo.jpg",
          type: "image/jpeg",
        } as any);

        await fetch(`https://yara-91kd.onrender.com/insumos/${id}/imagen`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      }

      showMessage({
        message: "Éxito",
        description: "Insumo actualizado correctamente",
        type: "success",
        duration: 2000,
        style: {
          borderRadius: 16,
          marginTop: 40,
          marginHorizontal: 16,
          padding: 10,
        },
      });

      navigation.goBack();
    } catch (error: any) {
      console.error("Error al actualizar insumo:", error.message || error);
      showMessage({
        message: "Error",
        description: "No se pudo actualizar el insumo",
        type: "danger",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!insumo) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <Ionicons name="leaf" size={48} color="#4BAE4F" />
          <Text style={styles.loadingText}>Cargando insumo...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1E5631" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Insumo</Text>
        <View style={styles.headerIcon}>
          <Ionicons name="create-outline" size={24} color="#4BAE4F" />
        </View>
      </View>

      {/* Main Card */}
      <View style={styles.mainCard}>
        {/* Image Section */}
        <View style={styles.imageSection}>
          <Text style={styles.sectionTitle}>Imagen del Insumo</Text>
          <View style={styles.imageContainer}>
            {preview ? (
              <View style={styles.imageWrapper}>
                <Image source={{ uri: preview }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => {
                    setImagen("");
                    setPreview("");
                  }}
                >
                  <Ionicons name="close" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            ) : insumo.img ? (
              <Image source={{ uri: insumo.img }} style={styles.image} />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="image-outline" size={48} color="#A7C97B" />
                <Text style={styles.placeholderText}>Sin imagen</Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
            <Ionicons name="camera" size={20} color="#FFF" />
            <Text style={styles.imageButtonText}>Cambiar Imagen</Text>
          </TouchableOpacity>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Información del Insumo</Text>

          {/* Required Fields */}
          <View style={styles.fieldGroup}>
            <Text style={styles.groupTitle}>Campos Obligatorios</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Nombre <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="leaf-outline"
                  size={20}
                  color="#4BAE4F"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={insumo.nombre}
                  onChangeText={(t) => setInsumo({ ...insumo, nombre: t })}
                  placeholder="Nombre del insumo"
                  placeholderTextColor="#A7C97B"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View
                style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}
              >
                <Text style={styles.label}>
                  Cantidad <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="calculator-outline"
                    size={20}
                    color="#4BAE4F"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={String(insumo.cantidad)}
                    onChangeText={(t) =>
                      setInsumo({ ...insumo, cantidad: Number(t) })
                    }
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#A7C97B"
                  />
                </View>
              </View>

              <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>
                  Unidad <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="scale-outline"
                    size={20}
                    color="#4BAE4F"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={insumo.unidad}
                    onChangeText={(t) => setInsumo({ ...insumo, unidad: t })}
                    placeholder="kg, L, etc."
                    placeholderTextColor="#A7C97B"
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Precio Unitario <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="cash-outline"
                  size={20}
                  color="#4BAE4F"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={String(insumo.precioUnitario)}
                  onChangeText={(t) =>
                    setInsumo({ ...insumo, precioUnitario: Number(t) })
                  }
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor="#A7C97B"
                />
              </View>
            </View>
          </View>

          {/* Informacion adicional */}
          <View style={styles.fieldGroup}>
            <Text style={styles.groupTitle}>Información Adicional</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Fecha de Ingreso</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color="#4BAE4F"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={formatDate(insumo.fechaIngreso)}
                  onChangeText={(t) =>
                    setInsumo({ ...insumo, fechaIngreso: t })
                  }
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="#A7C97B"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Fecha de Vencimiento</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="time-outline"
                  size={20}
                  color="#4BAE4F"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={formatDate(insumo.fechaVencimiento)}
                  onChangeText={(t) =>
                    setInsumo({ ...insumo, fechaVencimiento: t })
                  }
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="#A7C97B"
                />
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close-outline" size={20} color="#1E5631" />
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <Text style={styles.submitButtonText}>Actualizando...</Text>
          ) : (
            <>
              <Ionicons name="checkmark-outline" size={20} color="#FFF" />
              <Text style={styles.submitButtonText}>Actualizar</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1FDFD",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F1FDFD",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingCard: {
    backgroundColor: "#FFF",
    padding: 32,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#1E5631",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#1E5631",
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#FFF",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#1E5631",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8EAE6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E5631",
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8EAE6",
    justifyContent: "center",
    alignItems: "center",
  },
  mainCard: {
    margin: 20,
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#1E5631",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  imageSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E5631",
    marginBottom: 16,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  imageWrapper: {
    position: "relative",
  },
  image: {
    width: width - 88,
    height: 200,
    borderRadius: 16,
    backgroundColor: "#E8EAE6",
  },
  placeholderImage: {
    width: width - 88,
    height: 200,
    borderRadius: 16,
    backgroundColor: "#E8EAE6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#A7C97B",
    borderStyle: "dashed",
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    color: "#A7C97B",
    fontWeight: "500",
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 68, 68, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4BAE4F",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  imageButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  formSection: {
    gap: 24,
  },
  fieldGroup: {
    gap: 16,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E5631",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E5631",
  },
  required: {
    color: "#FF4444",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fcfcfcff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8EAE6",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1E5631",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  cancelButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8EAE6",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E5631",
  },
  submitButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4BAE4F",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: "#4BAE4F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: "#A7C97B",
    shadowOpacity: 0.1,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
  },
});

export default InsumoEdit;
