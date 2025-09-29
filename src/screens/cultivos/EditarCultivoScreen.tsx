"use client";

import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CultivoService } from "../../api/cultivoService";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Switch, Image } from "react-native";
import BottomNavBar from "../../components/BottomNavBar";
import { SafeAreaView } from "react-native-safe-area-context";
import { showMessage } from "react-native-flash-message";

export default function EditarCultivoScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { id, onGoBack } = route.params || {};

  const [cultivo, setCultivo] = useState("");
  const [etapa, setEtapa] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [rendimientoEsperado, setRendimientoEsperado] = useState("");
  const [loading, setLoading] = useState(false);
  const [activo, setActivo] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await CultivoService.obtenerPorId(id);
        setCultivo(data.cultivo || "");
        setEtapa(data.etapa || "");
        setFechaInicio(
          data.fechaInicio
            ? new Date(data.fechaInicio).toISOString().split("T")[0]
            : ""
        );
        setFechaFin(
          data.fechaFin
            ? new Date(data.fechaFin).toISOString().split("T")[0]
            : ""
        );
        setRendimientoEsperado(data.rendimientoEsperado?.toString() || "");
        setActivo(data.activo !== undefined ? data.activo : true);
      } catch (err) {
        console.error("❌ Error cargando cultivo:", err);
      }
    })();
  }, [id]);

  const handleActualizar = async () => {
    if (!cultivo.trim()) {
      showMessage({
        message: "El nombre del cultivo es obligatorio",
        type: "danger",
      });
      return;
    }

    setLoading(true);
    try {
      const actualizado: any = {};
      if (cultivo) actualizado.cultivo = cultivo;
      if (etapa) actualizado.etapa = etapa;
      if (fechaInicio)
        actualizado.fechaInicio = new Date(fechaInicio).toISOString();
      if (fechaFin) actualizado.fechaFin = new Date(fechaFin).toISOString();
      if (rendimientoEsperado)
        actualizado.rendimientoEsperado = Number(rendimientoEsperado);
      actualizado.activo = activo;

      const cultivoActualizado = await CultivoService.actualizar(
        id,
        actualizado
      );

      showMessage({
        message: "✅ Cultivo actualizado correctamente",
        type: "success",
        icon: "success",
        duration: 2000,
        position: "top",
        floating: true,
        style: { marginTop: 60 },
      });

      if (onGoBack && typeof onGoBack === "function") {
        onGoBack(cultivoActualizado);
      }
      navigation.goBack();
    } catch (err: any) {
      console.error("❌ Error actualizando cultivo:", err);
      showMessage({
        message: err.message || "No se pudo actualizar el cultivo",
        type: "danger",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({
    icon,
    placeholder,
    value,
    onChangeText,
    keyboardType = "default",
    multiline = false,
  }: any) => (
    <View style={styles.inputContainer}>
      <View style={styles.inputIconContainer}>
        <Ionicons name={icon} size={20} color="#4BAE4F" />
      </View>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        placeholder={placeholder}
        placeholderTextColor="#A7C97B"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E5631" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Cultivo</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Contenido */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 200 }]}
      >
        <View style={styles.mainCard}>
          <View style={styles.cardHeader}>
            <View style={styles.iconWrapper}>
              <Image
                source={require("../../../assets/img/YaraFonotipo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.cardTitle}>Información del Cultivo</Text>
            <Text style={styles.cardSubtitle}>
              Actualiza los datos de tu cultivo
            </Text>
          </View>

          <View style={styles.formSection}>
            <InputField
              icon="leaf-outline"
              placeholder="Nombre del cultivo"
              value={cultivo}
              onChangeText={setCultivo}
            />

            <InputField
              icon="trending-up-outline"
              placeholder="Etapa del cultivo"
              value={etapa}
              onChangeText={setEtapa}
            />

            <InputField
              icon="calendar-outline"
              placeholder="Fecha de inicio (YYYY-MM-DD)"
              value={fechaInicio}
              onChangeText={setFechaInicio}
            />

            <InputField
              icon="calendar-clear-outline"
              placeholder="Fecha de finalización (YYYY-MM-DD)"
              value={fechaFin}
              onChangeText={setFechaFin}
            />

            <InputField
              icon="analytics-outline"
              placeholder="Rendimiento esperado (kg)"
              value={rendimientoEsperado}
              onChangeText={setRendimientoEsperado}
              keyboardType="numeric"
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Cultivo activo</Text>
              <Switch
                value={activo}
                onValueChange={setActivo}
                thumbColor={activo ? "#4BAE4F" : "#f4f3f4"}
                trackColor={{ false: "#CCC", true: "#A7C97B" }}
              />
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={20} color="#4BAE4F" />
            <Text style={styles.infoTitle}>Consejos</Text>
          </View>
          <Text style={styles.infoText}>
            • Asegúrate de que las fechas sean correctas{"\n"}• El rendimiento
            esperado te ayudará a planificar mejor{"\n"}• Mantén actualizada la
            etapa del cultivo
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close-outline" size={20} color="#1E5631" />
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleActualizar}
          disabled={loading}
        >
          <Ionicons
            name={loading ? "hourglass-outline" : "checkmark-outline"}
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.saveButtonText}>
            {loading ? "Guardando..." : "Guardar Cambios"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 40,
    height: 40,
  },
  container: {
    flex: 1,
    backgroundColor: "#F8FDF9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E5631",
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  switchRow: { flexDirection: "row", alignItems: "center", marginVertical: 10 },
  switchLabel: { fontSize: 16, fontWeight: "600", color: "#333", flex: 1 },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginRight: 40,
  },
  headerSpacer: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  mainCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F0F9F1",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E5631",
    marginBottom: 8,
    textAlign: "center",
  },
  cardSubtitle: {
    fontSize: 16,
    color: "#A7C97B",
    textAlign: "center",
  },
  formSection: {
    gap: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FDF9",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E8F5E8",
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputIconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1E5631",
    paddingVertical: 16,
    fontWeight: "500",
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  infoCard: {
    backgroundColor: "#F0F9F1",
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#4BAE4F",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E5631",
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#1E5631",
    lineHeight: 20,
  },
  actionContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E8F5E8",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FDF9",
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: "#A7C97B",
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E5631",
  },
  saveButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4BAE4F",
    borderRadius: 16,
    paddingVertical: 16,
    elevation: 2,
    shadowColor: "#4BAE4F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: "#A7C97B",
    elevation: 0,
    shadowOpacity: 0,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
