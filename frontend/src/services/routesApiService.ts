import apiClient from "./apiClient";
import type { Route, RoutesListResponse, RouteItem } from "../types/routes";


export const fetchGetRoute = async (routeId: number): Promise<Route> => {
    const response = await apiClient.get(`/routes/${routeId}`);
    return response.data.data.route;
}

export const fetchUserRoutes = async (page = 1, perPage = 10): Promise<RoutesListResponse> => {
  const res = await apiClient.post("/routes/list", {
    page,
    per_page: perPage,
  });

  return res.data.data;
};

export const createRoute = async (): Promise<RouteItem> => {
  const res = await apiClient.post("/routes", { mode: "manual" });
  return res.data.data.route;
};

export const updateRoute = async (id: number, payload: any): Promise<void> => {
  await apiClient.patch(`/routes/${id}`, payload);
};

export const calculateRoute = async (id: number): Promise<string> => {
  const res = await apiClient.post(`/routes/${id}/calculate`);
  return res.data.data.job_id;
};

export const getJobProgress = async (jobId: string): Promise<{ progress: number; status: string }> => {
  const res = await apiClient.get(`/routes/job/${jobId}/progress`);
  return res.data.data;
};