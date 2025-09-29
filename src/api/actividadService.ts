import axios from "axios";

const API_URL = "https://yara-91kd.onrender.com/actividades";

const actividadService = {
  getAll: async () => {
    const res = await axios.get(API_URL);
    return res.data;
  },

  getById: async (id: string) => {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
  },

  create: async (data: any) => {
    const res = await axios.post(API_URL, data);
    return res.data;
  },

  update: async (id: string, data: any) => {
    const res = await axios.patch(`${API_URL}/${id}`, data);
    return res.data;
  },

  remove: async (id: string) => {
    const res = await axios.delete(`${API_URL}/${id}`);
    return res.data;
  },
};

export default actividadService;
