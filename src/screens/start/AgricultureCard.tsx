import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import type { RootStackParamList } from "../../navigation/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "AgricultureCard">;

export default function YaraCard({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../../assets/img/cover.jpg")}
        style={styles.background}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[
            "rgba(7, 31, 17, 0.8)",
            "rgba(20, 109, 67, 0.47)",
            "rgba(6, 68, 30, 0.03)",
          ]}
          locations={[0, 0.7, 1]}
          style={styles.overlay}
        />

        <View style={styles.header}>
          <View style={styles.brandContainer}>
            <View style={styles.logoContainer}>
              <Image
                source={require("../../../assets/img/LOGOYARABLANCO.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.taglineContainer}>
              <Ionicons name="leaf" color="#A7C97B" size={16} />
              <Text style={styles.tagline}>AGRICULTURA REINVENTADA</Text>
            </View>
          </View>

          <Text style={styles.title}>
            LA NUEVA ERA DE LA{"\n"}
            <Text style={styles.highlight}>AGRICULTURA</Text>
          </Text>
          <Text style={styles.subtitle}>
            Tecnología inteligente para el futuro sostenible del campo
          </Text>
        </View>
        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons name="analytics" color="#0891b2" size={24} />
              <Text style={styles.metricTitle}>IA</Text>
            </View>
            <Text style={styles.metricValue}>98.5%</Text>
            <Text style={styles.metricLabel}>Precisión</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons name="leaf-outline" color="#10b981" size={24} />
              <Text style={styles.metricTitle}>SOSTENIBILIDAD</Text>
            </View>
            <Text style={styles.metricValue}>+45%</Text>
            <Text style={styles.metricLabel}>Eficiencia</Text>
          </View>
        </View>

        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate("VistaPrincipal")}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryButtonText}>Comenzar con YARA</Text>
            <Ionicons name="arrow-forward" color="#ffffff" size={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.floatingElements}>
          <View style={[styles.floatingDot, { top: 120, right: 40 }]} />
          <View style={[styles.floatingDot, { top: 200, left: 30 }]} />
          <View style={[styles.floatingDot, { bottom: 180, right: 60 }]} />
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  background: {
    flex: 1,
    justifyContent: "space-between",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    padding: 32,
    paddingTop: 60,
  },
  brandContainer: {
    marginBottom: 24,
  },
  logoContainer: {
    alignSelf: "flex-start",
    borderRadius: 20,
    marginBottom: 12,
    width: 100, // tamaño fijo más grande
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 100, // ocupa la mayor parte del contenedor
    height: 100,
    resizeMode: "contain",
  },
  taglineContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tagline: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
    color: "#A7C97B",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    fontFamily: "Poppins_700Bold",
    color: "#ffffff",
    lineHeight: 38,
    letterSpacing: -1,
    marginBottom: 16,
  },
  highlight: {
    color: "#A7C97B",
    fontWeight: "900",
    fontFamily: "Poppins_900Black",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400",
    fontFamily: "Poppins_400Regular",
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 24,
  },
  metricsContainer: {
    position: "absolute",
    top: "55%",
    left: 32,
    right: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  metricHeader: {
    alignItems: "center",
    marginBottom: 12,
  },
  metricTitle: {
    fontSize: 10,
    fontWeight: "700",
    fontFamily: "Poppins_700Bold",
    color: "#64748b",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "900",
    fontFamily: "Poppins_900Black",
    color: "#1f2937",
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: "500",
    fontFamily: "Poppins_500Medium",
    color: "#64748b",
  },
  ctaContainer: {
    padding: 32,
    gap: 16,
  },
  primaryButton: {
    backgroundColor: "#1E5631",
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Poppins_700Bold",
    letterSpacing: 0.5,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  secondaryButtonText: {
    color: "#1E5631",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
  },
  floatingElements: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: "none",
  },
  floatingDot: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1E5631",
    shadowColor: "#1E5631",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
});
