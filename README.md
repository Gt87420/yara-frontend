## YARA Frontend

    Este es el **frontend de YARA**, una aplicación agropecuaria que permite gestionar cultivos, parcelas e insumos.
    El proyecto está desarrollado en **React Native con Expo**, usando **Firebase** para la autenticación y comunicación con un **backend REST API** (en constante evolución).

 ## Características

    - **React Native + Expo** para el desarrollo móvil multiplataforma
    - **Firebase Authentication**
    - Consumo de **API REST** con Axios
    - **Carga y manipulación de imágenes** con `expo-image-picker` y `expo-image-manipulator`
    - Integración con **react-native-maps** y **expo-location**
    - Estilos con **NativeWind (TailwindCSS)** y **React Native Elements**
    - Manejo de calendarios con `react-native-calendars`
    - Selectores y dropdowns con `react-native-element-dropdown` y `react-native-dropdown-picker`
    - Íconos con `@expo/vector-icons` y `lucide-react-native`

## Tecnologías utilizadas

    - **React Native (Expo 54)**
    - **Firebase v12**
    - **React Navigation v7** (navegación stack & tabs)
    - **Axios** (consumo de API)
    - **NativeWind (TailwindCSS)**
    - **React Native Elements**
    - **React Native Calendars**
    - **React Native Maps**
    - **AsyncStorage** para persistencia local

## Instalación

1. Clona el repositorio

    ```bash
    git clone https://github.com/Gt87420/yara-frontend.git
    cd yara-frontend

    ```

2. Instala dependencias
    npm install

3. Configura Firebase
    import { initializeApp, getApps, getApp } from "firebase/app";
    import { getAuth } from "firebase/auth";

        const firebaseConfig = {
        apiKey: "AIzaSyApN782KGEzHjhhojj9TyMTMEtJenoUuio",
        authDomain: "yara-e272e.firebaseapp.com",
        projectId: "yara-e272e",
        storageBucket: "yara-e272e.appspot.com",
        messagingSenderId: "1084341029105",
        appId: "1:1084341029105:web:bc649da9b6728b35268150",
        measurementId: "G-MF5NH7FNP3"
        };

        const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        export const auth = getAuth(app);

4. Corre el proyecto
        npx expo start

## Estructura del proyecto
    src/
    ├── api/               # Servicios para comunicación con API REST
    ├── components/        # Componentes reutilizables
    │   ├── Cultivos/
    │   └── Parcelas/
    ├── data/              # Datos estáticos (ej. departamentos.json)
    ├── navigation/        # Configuración de navegación
    ├── screens/           # Pantallas principales divididas por módulos
    │   ├── auth/
    │   ├── cultivos/
    │   ├── home/
    │   ├── insumos/
    │   ├── parcelas/
    │   └── start/
    ├── firebase.ts        # Configuración Firebase
    ├── App.tsx            # Entry point de la app
    └── app.json           # Configuración Expo

## Estado el proyecto
✅ Autenticación con Firebase
✅ Gestión de cultivos, parcelas e insumos en frontend
✅ Manejo de imágenes y mapas
🔗 Integración con backend activa
🔄 El backend está en desarrollo y se le están agregando más apartados, por lo que el frontend se irá ajustando a medida que evolucione
⏳ Mejoras en UI/UX y pruebas
