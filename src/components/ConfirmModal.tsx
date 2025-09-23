import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttons}>
            <TouchableOpacity style={[styles.button, styles.cancel]} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.confirm]} onPress={onConfirm}>
              <Text style={styles.confirmText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContainer: { width: 300, backgroundColor: "#fff", borderRadius: 10, padding: 20 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  message: { fontSize: 14, color: "#666", marginBottom: 20 },
  buttons: { flexDirection: "row", justifyContent: "flex-end" },
  button: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, marginLeft: 10 },
  cancel: { backgroundColor: "#eee" },
  confirm: { backgroundColor: "#FF4444" },
  cancelText: { color: "#666", fontWeight: "bold" },
  confirmText: { color: "#fff", fontWeight: "bold" },
});
