import type { DefaultValuesType } from "@/components/pages/UpdatePassword";
import { api } from "@/config/axios.config";
import type { LoginType } from "@/types/auth.types";

export const login = async (formData: LoginType) => {
    const { data } = await api.post('/auth/login', formData);

    return data;
}

export const updatePassword = async (formData: DefaultValuesType) => {
    const { data } = await api.patch("/auth/update-password", formData);
    
    return data;
}