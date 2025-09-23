import React from "react";
import AppNavigation from "./src/navigation";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { View } from "react-native";
import FlashMessage from "react-native-flash-message"; // 👈 importamos

SplashScreen.preventAutoHideAsync(); // evita que desaparezca antes de tiempo

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular: require("./assets/fonts/Poppins-Regular.ttf"),
    Poppins_600SemiBold: require("./assets/fonts/Poppins-SemiBold.ttf"),
    Poppins_700Bold: require("./assets/fonts/Poppins-Bold.ttf"),
    Poppins_900Black: require("./assets/fonts/Poppins-Black.ttf"),
  });

  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync(); // ocultamos el splash cuando cargan las fuentes
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <View />; // devuelve algo vacío mientras carga
  }

  return (
    <>
      <AppNavigation />
      <FlashMessage position="top" /> {/* 👈 agregamos el flash message */}
    </>
  );
}
