import axios from "axios";
import { getIdToken } from "firebase/auth";

const API = axios.create({
  baseURL: "https://yara-91kd.onrender.com", // tu backend
});

export const registerUser = async (user: any, token: string) => {
  return API.post("/auth/register", user, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const loginUser = async (token: string) => {
  return API.post("/auth/login", {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const googleLogin = async (token: string) => {
  return API.post("/auth/google-login", {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
