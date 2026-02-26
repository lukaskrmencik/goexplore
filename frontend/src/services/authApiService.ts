import apiClient from "./apiClient";
import { AUTH_TOKEN_KEY } from "../utils/auth";

interface LoginCredentials {
    email: string;
    password: string;
}

interface SignupCredentials {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export const login = async (credentials: LoginCredentials) => {
    return await apiClient.post("/login", credentials);
};

export const signup = async (credentials: SignupCredentials) => {
    return await apiClient.post("/signup", credentials);
};

export const logout = async () => {
    await apiClient.post("/logout");
    localStorage.removeItem(AUTH_TOKEN_KEY);
};
