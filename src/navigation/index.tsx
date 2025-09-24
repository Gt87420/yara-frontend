import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import VistaPrincipal from "../screens/auth/VistaPrincipal";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import GoogleLoginScreen from "../screens/auth/GoogleLoginScreen";
import AgricultureCard from "../screens/start/AgricultureCard";
import HomeScreen from "../screens/home/HomeScreen";
import ParcelasScreen from "../screens/parcelas/ParcelasScreen";
import DetallesParcelaScreen from "../screens/parcelas/DetallesParcelaScreen";
import CrearParcelaScreen from "../screens/parcelas/CrearParcelaScreen";
import ClimaScreen from "../screens/parcelas/ClimaScreen" 
import TestIcon from "../screens/start/TestIcon";
import { RootStackParamList } from "./types";
import Toast from "react-native-toast-message"; // 👈 Importa Toast
import CultivosScreen from "../screens/cultivos/CultivosScreen";
import CrearCultivoScreen from "../screens/cultivos/CrearCultivoScreen";
import EditarCultivoScreen from "../screens/cultivos/EditarCultivoScreen";
import DetallesCultivoScreen from "../screens/cultivos/DetallesCultivoScreen";
import InsumosList from "../screens/insumos/InsumosList";
import InsumoDetail from "../screens/insumos/InsumoDetail";
import InsumoCreate from "../screens/insumos/InsumoCreate";
import InsumoEdit from "../screens/insumos/InsumoEdit";


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
        <Stack.Screen name="DetallesParcelaScreen" component={DetallesParcelaScreen} />
        <Stack.Screen name="Clima" component={ClimaScreen} />

        <Stack.Screen name="Cultivos" component={CultivosScreen} />
        <Stack.Screen name="CrearCultivo" component={CrearCultivoScreen} />
        <Stack.Screen name="EditarCultivo" component={EditarCultivoScreen} />
        <Stack.Screen name="DetallesCultivo" component={DetallesCultivoScreen} />
        <Stack.Screen name="Insumos" component={InsumosList} />
        <Stack.Screen name="InsumoDetail" component={InsumoDetail} />
        <Stack.Screen name="InsumoCreate" component={InsumoCreate} />
        <Stack.Screen name="InsumoEdit" component={InsumoEdit} />
      </Stack.Navigator>

      {/* 👇 Esto debe estar al final del contenedor */}
      <Toast />
    </NavigationContainer>
  );
}
