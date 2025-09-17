import { View, Text, StyleSheet, Modal, ActivityIndicator } from "react-native"
import { BlurView } from "expo-blur"
import { LinearGradient } from "expo-linear-gradient"

interface LoadingOverlayProps {
  visible: boolean
  message?: string
  progress?: number
}

export default function LoadingOverlay({ visible, message = "Cargando...", progress }: LoadingOverlayProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <BlurView intensity={50} style={styles.overlay}>
        <View style={styles.loadingContainer}>
          <LinearGradient colors={["#059669", "#047857"]} style={styles.loadingCard}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>{message}</Text>

            {progress !== undefined && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{Math.round(progress)}%</Text>
              </View>
            )}
          </LinearGradient>
        </View>
      </BlurView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  loadingContainer: {
    margin: 40,
  },
  loadingCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  loadingText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  progressContainer: {
    width: "100%",
    marginTop: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "white",
    borderRadius: 2,
  },
  progressText: {
    color: "white",
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
    fontWeight: "500",
  },
})
