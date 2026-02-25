import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT ?? "30000"),
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid/expired - force logout
      localStorage.removeItem("token");

      // Optionally preserve the route they were trying to access
      const redirectPath = window.location.pathname !== '/login'
        ? `?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`
        : '';

      window.location.href = `/login${redirectPath}`;
    }
    return Promise.reject(error);
  }
);

export default apiClient;