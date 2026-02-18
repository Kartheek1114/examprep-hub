import axios from "axios";

// Automatically use the deployed backend URL if VITE_API_URL is set,
// otherwise fallback to localhost for development.
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Automatically attach the token to every request if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
