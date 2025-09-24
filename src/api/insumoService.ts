import { auth } from "../firebase";

const API_URL = "https://yara-91kd.onrender.com/insumos";

// 🔹 función interna para obtener el token
async function getToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
}

export const InsumoService = {
    // 📌 Obtener todos los insumos del usuario autenticado
    async obtenerTodosUsuario() {
        const token = await getToken();
        if (!token) throw new Error("No se encontró token");

        const res = await fetch(`${API_URL}/usuario`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Error al obtener insumos");
        return res.json();
    },

    // 📌 Obtener un insumo por ID
    async obtenerPorId(id: string) {
        const token = await getToken();
        if (!token) throw new Error("No se encontró token");

        const res = await fetch(`${API_URL}/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Error al obtener insumo");
        return res.json();
    },

    // 📌 Crear un insumo
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
        console.log("📡 Respuesta cruda del backend (crear insumo):", raw);

        if (!res.ok) throw new Error(`Error al crear insumo: ${raw}`);
        return raw ? JSON.parse(raw) : {};
    },

    // 📌 Editar un insumo
    async editar(id: string, data: any) {
        const token = await getToken();
        if (!token) throw new Error("No se encontró token");

        const res = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const raw = await res.text();
        console.log("📡 Respuesta cruda al actualizar insumo:", raw);

        if (!res.ok) throw new Error(`Error al actualizar insumo: ${raw}`);
        return raw ? JSON.parse(raw) : {};
    },

    // 📌 Eliminar un insumo
    async eliminar(id: string) {
        const token = await getToken();
        if (!token) throw new Error("No se encontró token");

        const res = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });

        const raw = await res.text();
        console.log("📡 Respuesta cruda al eliminar insumo:", raw);

        if (!res.ok) throw new Error(`Error al eliminar insumo: ${raw}`);
        return raw ? JSON.parse(raw) : { message: "Insumo eliminado exitosamente" };
    },
};
