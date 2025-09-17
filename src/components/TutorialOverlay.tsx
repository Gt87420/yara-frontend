"use client"

import { useState } from "react"
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { BlurView } from "expo-blur"

const { width, height } = Dimensions.get("window")

interface TutorialStep {
  title: string
  description: string
  icon: string
  position: { x: number; y: number }
}

interface TutorialOverlayProps {
  visible: boolean
  onClose: () => void
  onComplete: () => void
}

export default function TutorialOverlay({ visible, onClose, onComplete }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const steps: TutorialStep[] = [
    {
      title: "¡Bienvenido!",
      description: "Aprende a crear parcelas de forma fácil y precisa usando tu ubicación GPS.",
      icon: "hand-right",
      position: { x: width / 2, y: height / 2 },
    },
    {
      title: "Agregar Puntos GPS",
      description: 'Camina por el perímetro de tu terreno y presiona "Agregar Punto" en cada esquina.',
      icon: "location",
      position: { x: width / 2, y: height - 150 },
    },
    {
      title: "Visualización en Tiempo Real",
      description: "Verás tu parcela formarse automáticamente mientras agregas puntos.",
      icon: "eye",
      position: { x: width / 2, y: height / 3 },
    },
    {
      title: "Cálculo Automático",
      description: "El área y perímetro se calculan automáticamente con precisión GPS.",
      icon: "calculator",
      position: { x: width / 2, y: height - 200 },
    },
    {
      title: "¡Listo para Empezar!",
      description: "Nombra tu parcela y guárdala. ¡Es así de simple!",
      icon: "checkmark-circle",
      position: { x: width / 2, y: height / 2 },
    },
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    onClose()
  }

  const currentStepData = steps[currentStep]

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <BlurView intensity={30} style={styles.overlay}>
        {/* Spotlight effect */}
        <View
          style={[
            styles.spotlight,
            {
              left: currentStepData.position.x - 75,
              top: currentStepData.position.y - 75,
            },
          ]}
        />

        {/* Tutorial card */}
        <View style={styles.tutorialCard}>
          <LinearGradient colors={["#059669", "#047857"]} style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name={currentStepData.icon as any} size={32} color="white" />
            </View>
            <Text style={styles.stepCounter}>
              {currentStep + 1} de {steps.length}
            </Text>
          </LinearGradient>

          <View style={styles.cardContent}>
            <Text style={styles.tutorialTitle}>{currentStepData.title}</Text>
            <Text style={styles.tutorialDescription}>{currentStepData.description}</Text>

            {/* Progress indicator */}
            <View style={styles.progressContainer}>
              {steps.map((_, index) => (
                <View key={index} style={[styles.progressDot, index <= currentStep && styles.progressDotActive]} />
              ))}
            </View>

            {/* Navigation buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipButtonText}>Saltar</Text>
              </TouchableOpacity>

              <View style={styles.navigationButtons}>
                {currentStep > 0 && (
                  <TouchableOpacity style={styles.navButton} onPress={handlePrevious}>
                    <Ionicons name="chevron-back" size={20} color="#059669" />
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                  <Text style={styles.nextButtonText}>
                    {currentStep === steps.length - 1 ? "Comenzar" : "Siguiente"}
                  </Text>
                  {currentStep < steps.length - 1 && <Ionicons name="chevron-forward" size={20} color="white" />}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </BlurView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  spotlight: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  tutorialCard: {
    backgroundColor: "white",
    borderRadius: 20,
    margin: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  stepCounter: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  cardContent: {
    padding: 24,
  },
  tutorialTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
  },
  tutorialDescription: {
    fontSize: 16,
    color: "#6b7280",
    lineHeight: 24,
    marginBottom: 24,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e5e7eb",
  },
  progressDotActive: {
    backgroundColor: "#059669",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipButtonText: {
    color: "#6b7280",
    fontSize: 16,
    fontWeight: "500",
  },
  navigationButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#059669",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 8,
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})
