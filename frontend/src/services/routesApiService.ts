import apiClient from "./apiClient";
import type { 
  Route, 
  RouteMode, 
  RouteWaypoint,
  RoutesListResponse 
} from "../types/routes";
import type { 
  ApiResponse, 
  PaginatedResponse 
} from "../types/general";
import type { 
  GeneralEquipment, 
  MyEquipment, 
  EquipmentType 
} from "../types/equipment";

// Routes

export const createRoute = async (mode: RouteMode, name?: string): Promise<Route> => {
  const response = await apiClient.post<ApiResponse<{ route: Route }>>("/routes", { mode, name });
  return response.data.data.route;
};

export const fetchGetRoute = async (routeId: number): Promise<Route> => {
  const response = await apiClient.get<ApiResponse<{ route: Route }>>(`/routes/${routeId}`);
  return response.data.data.route;
};

export const updateRoute = async (routeId: number, data: Partial<any>): Promise<Route> => {
  const response = await apiClient.patch<ApiResponse<{ route: Route }>>(`/routes/${routeId}`, data);
  return response.data.data.route;
};

export const fetchUserRoutes = async (page = 1, search = ""): Promise<RoutesListResponse> => {
    const response = await apiClient.post<ApiResponse<RoutesListResponse>>("/routes/list", {
        page,
        search
    });
    return response.data.data;
};

// Calculation

export const calculateRoute = async (routeId: number): Promise<string> => {
  const response = await apiClient.post<ApiResponse<{ job_id: string }>>(`/routes/${routeId}/calculate`);
  return response.data.data.job_id;
};

export const getCalculationProgress = async (jobId: string): Promise<any> => {
  const response = await apiClient.get<ApiResponse<any>>(`/routes/job/${jobId}/progress`);
  return response.data.data;
};

// Waypoints

export const createWaypoint = async (routeId: number, order: number, lat: number, lng: number): Promise<RouteWaypoint> => {
  const payload = {
    order,
    location: {
      coordinates: [lng, lat]
    }
  };
  const response = await apiClient.post<ApiResponse<{ waypoint: RouteWaypoint }>>(`/routes/${routeId}/waypoints`, payload);
  return response.data.data.waypoint;
};

export const deleteWaypoint = async (waypointId: number): Promise<void> => {
  await apiClient.delete(`/routes/waypoints/${waypointId}`);
};

// Users

export const inviteUserToRoute = async (routeId: number): Promise<string> => {
  const response = await apiClient.post<ApiResponse<{ route: string }>>(`/routes/${routeId}/users/invite`, {});
  return response.data.data.route; 
};

export const removeUserFromRoute = async (routeId: number, userId: number): Promise<void> => {
    await apiClient.delete(`/routes/${routeId}/users`, {
        data: { user_id: userId }
    });
};

// Equipment

export const fetchMyEquipmentList = async (search?: string, page = 1): Promise<PaginatedResponse<MyEquipment>> => {
  const response = await apiClient.post<ApiResponse<PaginatedResponse<MyEquipment>>>("/my-equipment/list", { search, page });
  return response.data.data;
};

export const fetchGeneralEquipmentList = async (search?: string, page = 1): Promise<PaginatedResponse<GeneralEquipment>> => {
  const response = await apiClient.post<ApiResponse<PaginatedResponse<GeneralEquipment>>>("/general-equipment/list", { search, page });
  return response.data.data;
};

export const addEquipmentToRoute = async (routeId: number, type: EquipmentType, equipmentId: number): Promise<void> => {
  await apiClient.post(`/routes/${routeId}/equipment`, {
    type,
    equipment_id: equipmentId
  });
};

export const removeEquipmentFromRoute = async (routeId: number, type: EquipmentType, equipmentId: number): Promise<void> => {
  await apiClient.delete(`/routes/${routeId}/equipment`, {
    data: { 
      type,
      equipment_id: equipmentId
    }
  });
};