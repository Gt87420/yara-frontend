import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";


type NavProps = NativeStackNavigationProp<RootStackParamList>;

export default function BottomNavBar() {
  const navigation = useNavigation<NavProps>();

  return (
    <View style={styles.navBar}>
      {/* 🏠 Inicio */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("Home")}
      >
        <Ionicons name="home" size={24} color="#10b981" />
        <Text style={styles.navText}>Inicio</Text>
      </TouchableOpacity>

      {/* 📌 Cultivos */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("Cultivos")}
      >
        <Ionicons name="leaf" size={24} color="#15803d" />
        <Text style={styles.navText}>Cultivos</Text>
      </TouchableOpacity>

      {/* 📌 Parcelas */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("Parcelas")}
      >
        <Ionicons name="map" size={24} color="#0ea5e9" />
        <Text style={styles.navText}>Parcelas</Text>
      </TouchableOpacity>

      {/* 🚪 Cerrar sesión */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("Login", { google: false })}
      >
        <Ionicons name="log-out-outline" size={24} color="#dc2626" />
        <Text style={styles.navText}>Salir</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    color: "#374151",
  },
});
