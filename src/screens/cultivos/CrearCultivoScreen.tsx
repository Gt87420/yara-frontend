"use client";

import { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { CultivoService } from "../../api/cultivoService";
import { auth } from "../../firebase";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { showMessage } from "react-native-flash-message";
import BottomNavBar from "../../components/BottomNavBar";

export default function CrearCultivoScreen() {
  const [parcelaId, setParcelaId] = useState("");
  const [parcelas, setParcelas] = useState<any[]>([]);
  const [cultivo, setCultivo] = useState("");
  const [etapa, setEtapa] = useState("");
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [rendimientoEsperado, setRendimientoEsperado] = useState("");
  const [imagen, setImagen] = useState<string>("");
  const [preview, setPreview] = useState<string>("");
  const [cultivosCreados, setCultivosCreados] = useState<any[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const scrollRef = useRef<ScrollView>(null);

  const inputRefs = {
    cultivo: useRef<TextInput>(null),
    etapa: useRef<TextInput>(null),
    rendimiento: useRef<TextInput>(null),
  };

  const stages = [
    "Siembra",
    "Germinación",
    "Desarrollo vegetativo",
    "Crecimiento",
    "Floración",
    "Fructificación",
    "Maduración",
    "Cosecha",
    "Post Cosecha",
  ];

  const navigation = useNavigation<any>();

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
      if (!res.ok) throw new Error("Error al obtener parcelas");
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
      if (!res.ok) throw new Error("Error al obtener cultivos");
      const data = await res.json();
      setCultivosCreados(Array.isArray(data) ? data : data.cultivos || []);
    } catch (err) {
      console.error("❌ Error cargando cultivos:", err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchParcelas();
      fetchCultivos();
    }, [refreshTrigger])
  );

  const handleEditar = (id: string) => {
    navigation.navigate("EditarCultivo", {
      id,
      onGoBack: () => setRefreshTrigger((prev) => prev + 1),
    });
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });
      if (result.canceled) return;

      const manipResult = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 600 } }],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      setImagen(manipResult.uri);
      setPreview(manipResult.uri);
    } catch (err) {
      console.error("❌ Error seleccionando imagen:", err);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });
      if (result.canceled) return;

      const manipResult = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 600 } }],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      setImagen(manipResult.uri);
      setPreview(manipResult.uri);
    } catch (err) {
      console.error("❌ Error tomando foto:", err);
    }
  };

  const scrollToInput = (ref: any) => {
    ref.current?.measure(
      (
        _fx: number,
        _fy: number,
        _width: number,
        _height: number,
        px: number,
        py: number
      ) => {
        scrollRef.current?.scrollTo({ y: py - 100, animated: true });
      }
    );
  };

  const handleGuardar = async () => {
    try {
      const user = auth.currentUser; // 🔹 Aquí defines 'user'
      if (!user) {
        showMessage({
          message: "Error",
          description: "No se encontró el usuario autenticado",
          type: "danger",
          icon: "danger",
        });
        return;
      }

      if (
        !parcelaId ||
        !cultivo ||
        !etapa ||
        !fechaInicio ||
        !rendimientoEsperado
      ) {
        showMessage({
          message: "Campos incompletos",
          description: "⚠️ Todos los campos son obligatorios excepto la imagen",
          type: "warning",
          icon: "warning",
          duration: 3000,
          position: "top",
          floating: true,
        });
        return;
      }

      const nuevo: any = {
        usuarioUid: user.uid, // 🔹 Ahora 'user' está definido
        parcelaId,
        cultivo,
        etapa,
        fechaInicio: fechaInicio.toISOString(),
        rendimientoEsperado: Number(rendimientoEsperado),
      };

      const cultivoCreado = await CultivoService.crear(nuevo);

      if (imagen && cultivoCreado?._id) {
        const token = await user.getIdToken();

        const formData = new FormData();
        formData.append("file", {
          uri: imagen,
          name: "cultivo.jpg",
          type: "image/jpeg",
        } as any);

        await fetch(
          `https://yara-91kd.onrender.com/cultivos/${cultivoCreado._id}/imagen`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          }
        );
      }

      showMessage({
        message: "Cultivo creado correctamente",
        description: "✅ Guardado con éxito",
        type: "success",
        icon: "success",
        duration: 2000,
        position: "top",
        floating: true,
        style: { marginTop: 60 },
      });

      setParcelaId("");
      setCultivo("");
      setEtapa("");
      setFechaInicio(null);
      setRendimientoEsperado("");
      setImagen("");
      setPreview("");
      setRefreshTrigger((prev) => prev + 1);

      navigation.navigate("Cultivos");
    } catch (err) {
      console.error("❌ Error creando cultivo:", err);
      showMessage({
        message: "❌ Error",
        description: "No se pudo crear el cultivo",
        type: "danger",
        icon: "danger",
        duration: 3000,
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Ionicons name="leaf" size={28} color="#FFFFFF" />
            <Text style={styles.headerTitle}>Nuevo Cultivo</Text>
          </View>
          <Text style={styles.headerSubtitle}>Registra tu próxima cosecha</Text>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Form Card */}
          <View style={styles.formCard}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="agriculture" size={24} color="#4BAE4F" />
              <Text style={styles.cardTitle}>Información del Cultivo</Text>
            </View>

            {/* Parcela Selection */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Ionicons name="location" size={16} color="#1E5631" />
                <Text style={styles.labelText}>Parcela</Text>
              </View>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={parcelaId}
                  onValueChange={(itemValue) => setParcelaId(itemValue)}
                  style={styles.picker}
                  dropdownIconColor="#4BAE4F"
                >
                  <Picker.Item label="Selecciona una parcela" value="" />
                  {parcelas.map((p) => (
                    <Picker.Item key={p._id} label={p.nombre} value={p._id} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Cultivo Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <MaterialIcons name="eco" size={16} color="#1E5631" />
                <Text style={styles.labelText}>Nombre del Cultivo</Text>
              </View>
              <TextInput
                ref={inputRefs.cultivo}
                placeholder="Ej: Tomate, Maíz, Lechuga..."
                style={styles.input}
                value={cultivo}
                onChangeText={setCultivo}
                placeholderTextColor="#A7C97B"
                onFocus={() => scrollToInput(inputRefs.cultivo)}
              />
            </View>

            {/* Etapa Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <MaterialIcons name="timeline" size={16} color="#1E5631" />
                <Text style={styles.labelText}>Etapa</Text>
              </View>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={etapa}
                  onValueChange={(itemValue) => setEtapa(itemValue)}
                  style={styles.picker}
                  dropdownIconColor="#4BAE4F"
                >
                  <Picker.Item label="Selecciona una etapa" value="" />
                  {stages.map((stage) => (
                    <Picker.Item key={stage} label={stage} value={stage} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Fecha Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Ionicons name="calendar" size={16} color="#1E5631" />
                <Text style={styles.labelText}>Fecha de Inicio</Text>
              </View>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ color: fechaInicio ? "#000" : "#A7C97B" }}>
                  {fechaInicio
                    ? fechaInicio.toLocaleDateString()
                    : "Selecciona fecha"}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={fechaInicio || new Date()}
                  mode="date"
                  display="default"
                  onChange={(_, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) setFechaInicio(selectedDate);
                  }}
                />
              )}
            </View>

            {/* Rendimiento Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <MaterialIcons name="trending-up" size={16} color="#1E5631" />
                <Text style={styles.labelText}>Rendimiento Esperado</Text>
              </View>
              <TextInput
                ref={inputRefs.rendimiento}
                placeholder="Cantidad esperada (kg, ton, etc.)"
                style={styles.input}
                keyboardType="numeric"
                value={rendimientoEsperado}
                onChangeText={setRendimientoEsperado}
                placeholderTextColor="#A7C97B"
                onFocus={() => scrollToInput(inputRefs.rendimiento)}
              />
            </View>
          </View>

          {/* Image Card */}
          <View style={styles.imageCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="camera" size={24} color="#4BAE4F" />
              <Text style={styles.cardTitle}>Fotografía del Cultivo</Text>
            </View>

            <View style={styles.imageButtons}>
              <TouchableOpacity
                style={styles.imageButton}
                onPress={handlePickImage}
              >
                <Ionicons name="images" size={20} color="#FFFFFF" />
                <Text style={styles.imageButtonText}>Galería</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.imageButton}
                onPress={handleTakePhoto}
              >
                <Ionicons name="camera" size={20} color="#FFFFFF" />
                <Text style={styles.imageButtonText}>Cámara</Text>
              </TouchableOpacity>
            </View>

            {preview && (
              <View style={styles.previewContainer}>
                <Image
                  source={{ uri: preview }}
                  style={styles.preview}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => {
                    setImagen("");
                    setPreview("");
                  }}
                >
                  <Ionicons name="close-circle" size={24} color="#FF4444" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleGuardar}>
            <MaterialIcons name="save" size={24} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Guardar Cultivo</Text>
          </TouchableOpacity>
        </ScrollView>
        {/* Barra de navegación */}
        <BottomNavBar />
      </View>
    </KeyboardAvoidingView>
  );
}
// Nota: Mantén tu StyleSheet original o ajusta según tu diseño.

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAF9",
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4, // espacio entre label y input
  },

  labelText: {
    fontSize: 14,
    color: "#1E5631",
    fontWeight: "500",
  },
  header: {
    backgroundColor: "#4BAE4F",
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#1E5631",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginLeft: 12,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.9,
    marginLeft: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#1E5631",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  imageCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#1E5631",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E5631",
    marginLeft: 12,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E5631",
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#A7C97B",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1E5631",
    backgroundColor: "#FFFFFF",
  },
  pickerContainer: {
    borderWidth: 1.5,
    borderColor: "#A7C97B",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  picker: {
    height: 50,
    color: "#1E5631",
  },
  imageButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  imageButton: {
    backgroundColor: "#4BAE4F",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
    shadowColor: "#1E5631",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  imageButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  previewContainer: {
    position: "relative",
    marginTop: 16,
  },
  preview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 2,
  },
  saveButton: {
    backgroundColor: "#4BAE4F",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#1E5631",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 18,
    marginLeft: 8,
  },
});
