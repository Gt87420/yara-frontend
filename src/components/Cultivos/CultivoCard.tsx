import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface Props {
  cultivo: any;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function CultivoCard({ cultivo, onPress, onEdit, onDelete }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.name}>{cultivo.cultivo}</Text>
        <Text style={styles.etapa}>Etapa: {cultivo.etapa}</Text>
      </View>
      <Text style={styles.detail}>Inicio: {cultivo.fechaInicio}</Text>
      <Text style={styles.detail}>Fin: {cultivo.fechaFin || "No definido"}</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onEdit}>
          <Text style={styles.edit}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete}>
          <Text style={styles.delete}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  header: { flexDirection: "row", justifyContent: "space-between" },
  name: { fontSize: 18, fontWeight: "bold" },
  etapa: { fontSize: 14, color: "#555" },
  detail: { fontSize: 13, color: "#666", marginTop: 4 },
  actions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 10, gap: 12 },
  edit: { color: "blue", fontSize: 16 },
  delete: { color: "red", fontSize: 16 },
});
