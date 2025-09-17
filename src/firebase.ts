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

// 🚨 Solo persistencia en memoria (Expo Go no permite otra cosa)
export const auth = getAuth(app);
