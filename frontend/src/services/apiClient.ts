import axios from "axios";
import { AUTH_TOKEN_KEY } from "../utils/auth";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT ?? "30000"),
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isLoginRequest = error.config?.url === '/login' || error.config?.url?.endsWith('/login');

      if (!isLoginRequest) {
        localStorage.removeItem(AUTH_TOKEN_KEY);

        const redirectPath = window.location.pathname !== '/login'
          ? `?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`
          : '';

        window.location.href = `/login${redirectPath}`;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
