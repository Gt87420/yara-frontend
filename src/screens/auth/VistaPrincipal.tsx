import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Dimensions,
  Image,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";
import { LinearGradient } from "expo-linear-gradient";

type Props = NativeStackScreenProps<RootStackParamList, "VistaPrincipal">;

const { width, height } = Dimensions.get("window");

export default function VistaPrincipal({ navigation }: Props) {
  return (
    <ImageBackground
      source={require("../../../assets/img/cover.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <LinearGradient
        colors={["rgba(23, 87, 46, 0.8)", "rgba(0, 0, 0, 0.6)"]}
        style={styles.overlay}
      >
        <View style={styles.container}>
          {/* Header Section */}
          <View style={styles.header}>
            <Image
              source={require("../../../assets/img/LOGOYARABLANCO.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.tagline}>
              Innovando la Agricultura para un Futuro Sostenible
            </Text>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            <View style={styles.heroSection}>
              <Text style={styles.heroTitle}>
                La Nueva Era de la{"\n"}Agricultura
              </Text>
              <Text style={styles.heroSubtitle}>
                Únete a miles de agricultores que ya están transformando sus
                cultivos con tecnología inteligente
              </Text>
            </View>

            {/* Authentication Buttons */}
            <View style={styles.authSection}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => navigation.navigate("Registro")}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>Comenzar Ahora</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => navigation.navigate("Login", { google: false })}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>Iniciar Sesión</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.googleButton}
                onPress={() => navigation.navigate("Login", { google: true })}
                activeOpacity={0.8}
              >
                <View style={styles.googleButtonContent}>
                  <Text style={styles.googleIcon}>G</Text>
                  <Text style={styles.googleButtonText}>
                    Continuar con Google
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Al continuar, aceptas nuestros términos y condiciones
            </Text>
          </View>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: "space-between",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 150,
    height: 75,
  },
  tagline: {
    fontSize: 14,
    color: "#e5e7eb",
    textAlign: "center",
    marginTop: 8,
    fontWeight: "300",
    fontFamily: "Poppins_400Regular",
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 60,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: "800",
    fontFamily: "Poppins_700Bold",
    color: "#ffffff",
    textAlign: "center",
    lineHeight: 42,
    marginBottom: 16,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#d1d5db",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
    fontWeight: "400",
    fontFamily: "Poppins_400Regular",
  },
  authSection: {
    width: "100%",
    maxWidth: 320,
    gap: 16,
  },
  primaryButton: {
    backgroundColor: "#4BAE4F",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Poppins_700Bold", // ✅ solo aquí
  },
  secondaryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  secondaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  googleButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  googleButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4285f4",
  },
  googleButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    fontWeight: "300",
  },
});
