import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import VistaPrincipal from "../screens/auth/VistaPrincipal";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import GoogleLoginScreen from "../screens/auth/GoogleLoginScreen";
import AgricultureCard from "../screens/start/AgricultureCard";
import HomeScreen from "../screens/home/HomeScreen";
import ParcelasScreen from "../screens/parcelas/ParcelasScreen";
import CrearParcelaScreen from "../screens/parcelas/CrearParcelaScreen";
import TestIcon from "../screens/start/TestIcon";
import { RootStackParamList } from "./types";
import Toast from "react-native-toast-message"; // 👈 Importa Toast

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="AgricultureCard"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="AgricultureCard" component={AgricultureCard} />
        <Stack.Screen
          name="VistaPrincipal"
          component={VistaPrincipal}
          options={{ title: "Bienvenido" }}
        />
        <Stack.Screen name="Registro" component={RegisterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen
          name="GoogleLogin"
          component={GoogleLoginScreen}
          options={{ title: "Login con Google" }}
        />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Inicio" }} />
        <Stack.Screen name="Parcelas" component={ParcelasScreen} />
        <Stack.Screen name="CrearParcela" component={CrearParcelaScreen} />
      </Stack.Navigator>

      {/* 👇 Esto debe estar al final del contenedor */}
      <Toast />
    </NavigationContainer>
  );
}
