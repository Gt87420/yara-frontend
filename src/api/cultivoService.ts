// src/api/cultivoService.ts
import { auth } from "../firebase";

const API_URL = "https://yara-91kd.onrender.com/cultivos";

// 🔹 función interna para obtener el token
async function getToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
}

export const CultivoService = {
    // 📌 Obtener todos los cultivos del usuario logueado
    async obtenerTodosUsuario() {
        const token = await getToken();
        if (!token) throw new Error("No se encontró token");

        const res = await fetch(`${API_URL}/usuario`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Error al obtener cultivos");
        return res.json();
    },

    // 📌 Obtener un cultivo por ID
    async obtenerPorId(id: string) {
        const token = await getToken();
        if (!token) throw new Error("No se encontró token");

        const res = await fetch(`${API_URL}/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Error al obtener cultivo");
        return res.json();
    },

    // 📌 Crear un cultivo
    async crear(data: any) {
        const token = await getToken();
        if (!token) throw new Error("No se encontró token");

        const res = await fetch(`${API_URL}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const raw = await res.text();
        console.log("📡 Respuesta cruda del backend:", raw);

        if (!res.ok) {
            throw new Error(`Error al crear cultivo: ${raw}`);
        }

        return raw ? JSON.parse(raw) : {};
    },

    // 📌 Editar un cultivo
    async editar(id: string, data: any) {
        const token = await getToken();
        if (!token) throw new Error("No se encontró token");

        const res = await fetch(`${API_URL}/${id}`, {
            method: "PUT", // ✅ sin /editar
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const raw = await res.text();
        console.log("📡 Respuesta cruda al actualizar:", raw);

        if (!res.ok) {
            throw new Error(`Error al actualizar cultivo: ${raw}`);
        }

        return raw ? JSON.parse(raw) : {};
    },

    // 📌 Alias para compatibilidad
    async actualizar(id: string, data: any) {
        return this.editar(id, data);
    },

    // 📌 Eliminar un cultivo
    async eliminar(id: string) {
        const token = await getToken();
        if (!token) throw new Error("No se encontró token");

        const res = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });

        const raw = await res.text();
        console.log("📡 Respuesta cruda al eliminar:", raw);

        if (!res.ok) {
            throw new Error(`Error al eliminar cultivo: ${raw}`);
        }

        return raw ? JSON.parse(raw) : { message: "Cultivo eliminado exitosamente" };
    }
};
