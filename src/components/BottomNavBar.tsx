"use client"

import { View, TouchableOpacity, Text, StyleSheet, Platform, Modal, Animated } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation, useRoute } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RootStackParamList } from "../navigation/types"
import { useState, useRef, useEffect } from "react"

type NavProps = NativeStackNavigationProp<RootStackParamList>

// Solo 3 items principales en la barra de navegación
const NAV_ITEMS = [
  { name: "Home", icon: "home-outline", label: "Inicio" },
  { name: "Gestion", icon: "grid-outline", label: "Gestión" },
  { name: "Profile", icon: "person-outline", label: "Perfil" },
] as const

// Chat IA ahora está dentro de Gestión
const GESTION_ITEMS = [
  { name: "ChatIA", icon: "chatbubbles-outline", label: "Chat IA", color: "#4BAE4F" },
  { name: "Cultivos", icon: "leaf-outline", label: "Cultivos", color: "#4BAE4F" },
  { name: "Insumos", icon: "cube-outline", label: "Insumos", color: "#A7C97B" },
  { name: "Parcelas", icon: "map-outline", label: "Parcelas", color: "#1E5631" },
  { name: "ActividadesList", icon: "clipboard-outline", label: "Actividades", color: "#4BAE4F" },
] as const

export default function BottomNavBar() {
  const navigation = useNavigation<NavProps>()
  const route = useRoute()
  const [showGestionModal, setShowGestionModal] = useState(false)
  const scaleAnim = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current

  const currentRoute = route.name

  useEffect(() => {
    if (showGestionModal) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [showGestionModal])

  const handlePress = (screenName: string) => {
    if (screenName === "Gestion") {
      setShowGestionModal(true)
    } else {
      navigation.navigate(screenName as any)
    }
  }

  const handleGestionItemPress = (screenName: string) => {
    setShowGestionModal(false)
    setTimeout(() => {
      navigation.navigate(screenName as any)
    }, 200)
  }

  const isGestionActive = GESTION_ITEMS.some((item) => item.name === currentRoute)

  return (
    <>
      <View style={styles.container}>
        <View style={styles.navBar}>
          {NAV_ITEMS.map((item) => {
            const isActive = currentRoute === item.name || (item.name === "Gestion" && isGestionActive)

            return (
              <TouchableOpacity
                key={item.name}
                style={styles.navItem}
                onPress={() => handlePress(item.name)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
                  <Ionicons name={item.icon as any} size={24} color={isActive ? "#4BAE4F" : "#9CA3AF"} />
                  {isActive && <View style={styles.activeDot} />}
                </View>
                <Text style={[styles.navText, isActive && styles.navTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      <Modal
        transparent
        visible={showGestionModal}
        animationType="none"
        onRequestClose={() => setShowGestionModal(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowGestionModal(false)}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Ionicons name="grid" size={24} color="#1E5631" />
              <Text style={styles.modalTitle}>Gestión Agrícola</Text>
              <TouchableOpacity onPress={() => setShowGestionModal(false)} style={styles.closeButton}>
                <Ionicons name="close-circle" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View style={styles.gestionGrid}>
              {GESTION_ITEMS.map((item) => {
                const isActive = currentRoute === item.name
                return (
                  <TouchableOpacity
                    key={item.name}
                    style={[styles.gestionItem, isActive && styles.gestionItemActive]}
                    onPress={() => handleGestionItemPress(item.name)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.gestionIconContainer, { backgroundColor: item.color + "15" }]}>
                      <Ionicons name={item.icon as any} size={32} color={item.color} />
                    </View>
                    <Text style={styles.gestionLabel}>{item.label}</Text>
                    {isActive && <View style={styles.gestionActiveBadge} />}
                  </TouchableOpacity>
                )
              })}
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E8EAE6",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingBottom: Platform.OS === "ios" ? 20 : 8,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    flex: 1,
  },
  iconContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    borderRadius: 12,
    marginBottom: 2,
  },
  iconContainerActive: {
    backgroundColor: "#F0F9F1",
  },
  activeDot: {
    position: "absolute",
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#4BAE4F",
  },
  navText: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
    marginTop: 2,
  },
  navTextActive: {
    color: "#1E5631",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E5631",
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  gestionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  gestionItem: {
    width: "47%",
    backgroundColor: "#F8FAF9",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    position: "relative",
    borderWidth: 2,
    borderColor: "transparent",
  },
  gestionItemActive: {
    borderColor: "#4BAE4F",
    backgroundColor: "#F0F9F1",
  },
  gestionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  gestionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E5631",
    textAlign: "center",
  },
  gestionActiveBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4BAE4F",
  },
})