import Env from "@/utils/index.utils";
import axios from "axios";

export const api = axios.create({
    baseURL: Env.VITE_BASE_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('AUTH_TOKEN');

    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});