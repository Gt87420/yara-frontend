"use client";

import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRoute, useNavigation } from "@react-navigation/native";
import actividadService from "../../api/actividadService";
import { Ionicons } from "@expo/vector-icons";
import { showMessage } from "react-native-flash-message";

const formatDate = (date: Date | null) => {
  if (!date) return "Seleccionar fecha";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const ActividadEdit = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { id } = route.params;

  const [estado, setEstado] = useState("pendiente");
  const [fechaReal, setFechaReal] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await actividadService.getById(id);
        setEstado(data.estado || "pendiente");
        setFechaReal(data.fechaReal ? new Date(data.fechaReal) : null);
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "No se pudo cargar la actividad");
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const data = {
        estado,
        fechaReal: fechaReal ? fechaReal.toISOString() : null,
      };

      await actividadService.update(id, data);

      showMessage({
        message: "Actividad actualizada correctamente",
        type: "success",
        icon: "success",
        duration: 2000,
        position: "top",
        floating: true,
        style: { marginTop: 60 },
      });

      navigation.goBack();
    } catch (e: any) {
      console.error(e);
      showMessage({
        message: "❌ No se pudo actualizar la actividad",
        type: "danger",
        icon: "danger",
        duration: 3000,
        position: "top",
        floating: true,
        style: { marginTop: 60 },
      });
    } finally {
      setLoading(false);
    }
  };
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <Ionicons name="checkmark-circle" size={48} color="#4BAE4F" />
          <Text style={styles.loadingText}>Cargando actividad...</Text>
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
        <Text style={styles.headerTitle}>Editar Actividad</Text>
        <View style={styles.headerIcon}>
          <Ionicons name="create-outline" size={24} color="#4BAE4F" />
        </View>
      </View>

      {/* Main Card */}
      <View style={styles.mainCard}>
        {/* Form Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Estado de la Actividad</Text>

          {/* Estado Field */}
          <View style={styles.fieldGroup}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Estado <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.pickerWrapper}>
                <Ionicons
                  name="flag-outline"
                  size={20}
                  color="#4BAE4F"
                  style={styles.inputIcon}
                />
                <Picker
                  selectedValue={estado}
                  onValueChange={(value) => setEstado(value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Pendiente" value="pendiente" />
                  <Picker.Item label="Completada" value="completada" />
                  <Picker.Item label="Cancelada" value="cancelada" />
                </Picker>
              </View>
            </View>

            {/* Fecha Real Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Fecha Real <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color="#4BAE4F"
                  style={styles.inputIcon}
                />
                <Text
                  style={[
                    styles.dateText,
                    !fechaReal && styles.dateTextPlaceholder,
                  ]}
                >
                  {formatDate(fechaReal)}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#A7C97B" />
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={fechaReal || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setFechaReal(selectedDate);
                }}
              />
            )}
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color="#4BAE4F" />
            <Text style={styles.infoText}>
              Actualiza el estado y la fecha real de ejecución de la actividad.
            </Text>
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
            <>
              <ActivityIndicator size="small" color="#FFF" />
              <Text style={styles.submitButtonText}>Actualizando...</Text>
            </>
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
    backgroundColor: "#1E5631",
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
    color: "#fff",
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
  formSection: {
    gap: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E5631",
    marginBottom: 8,
  },
  fieldGroup: {
    gap: 16,
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
  pickerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fcfcfcff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8EAE6",
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  picker: {
    flex: 1,
    color: "#1E5631",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fcfcfcff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8EAE6",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: "#1E5631",
    marginLeft: 12,
  },
  dateTextPlaceholder: {
    color: "#A7C97B",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8EAE6",
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#1E5631",
    lineHeight: 20,
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

export default ActividadEdit;
