import apiClient from "./apiClient";
import type {
  Route,
  RouteMode,
  RouteWaypoint,
  RoutesListResponse,
  InviteDetails,
  CalculationProgressData
} from "../types/routes";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationMeta
} from "../types/general";
import type {
  GeneralEquipment,
  MyEquipment,
  EquipmentType
} from "../types/equipment";

export const createRoute = async (mode: RouteMode, name?: string): Promise<Route> => {
  const payload = {
    mode,
    name: name && name.trim() !== "" ? name : undefined
  };
  const response = await apiClient.post<ApiResponse<{ route: Route }>>("/routes", payload);
  return response.data.data.route;
};

export const fetchGetRoute = async (routeId: number): Promise<Route> => {
  const response = await apiClient.get<ApiResponse<{ route: Route }>>(`/routes/${routeId}`);
  return response.data.data.route;
};

export const updateRoute = async (routeId: number, data: Record<string, unknown>): Promise<Route> => {
  const response = await apiClient.patch<ApiResponse<{ route: Route }>>(`/routes/${routeId}`, data);
  return response.data.data.route;
};

export const deleteRoute = async (routeId: number): Promise<void> => {
  await apiClient.delete(`/routes/${routeId}`);
};

const ROUTES_PER_PAGE = Number(import.meta.env.VITE_ROUTES_PER_PAGE) || 11;

export const fetchAllRoutes = async (page = 1, search = ""): Promise<RoutesListResponse> => {
  const response = await apiClient.post<ApiResponse<RoutesListResponse>>("/routes/list", {
    page,
    per_page: ROUTES_PER_PAGE,
    search: search || undefined
  });
  return response.data.data;
};

export const fetchSharedRoutes = async (page = 1, search = ""): Promise<RoutesListResponse> => {
  const response = await apiClient.post<ApiResponse<RoutesListResponse>>("/routes/shared", {
    page,
    per_page: ROUTES_PER_PAGE,
    search: search || undefined
  });
  return response.data.data;
};

export const calculateRoute = async (routeId: number): Promise<string> => {
  const response = await apiClient.post<ApiResponse<{ job_id: string }>>(`/routes/${routeId}/calculate`);
  return response.data.data.job_id;
};

export const getCalculationProgress = async (jobId: string): Promise<CalculationProgressData> => {
  const response = await apiClient.get<ApiResponse<CalculationProgressData>>(`/routes/job/${jobId}/progress`);
  return response.data.data;
};

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

export const inviteUserToRoute = async (routeId: number): Promise<string> => {
  const response = await apiClient.post<ApiResponse<{ token: string }>>(`/routes/${routeId}/users/invite`, {});
  return response.data.data.token;
};

export const removeUserFromRoute = async (routeId: number, userId: number): Promise<void> => {
  await apiClient.delete(`/routes/${routeId}/users`, {
    data: { user_id: userId }
  });
};

export const fetchInviteDetails = async (token: string): Promise<InviteDetails> => {
  const response = await apiClient.get<ApiResponse<InviteDetails>>(`/routes/users/invite/${token}`);
  return response.data?.data || { inviter_name: 'Neznámý', route_name: 'Neznámá trasa', route_id: 0, is_owner: false, is_member: false };
};

export const acceptInviteToRoute = async (token: string): Promise<number> => {
  const response = await apiClient.post<ApiResponse<{ route_id: number }>>(`/routes/users/accept-invite`, { token });
  return response.data?.data?.route_id || 0;
};

export const fetchMyEquipmentList = async (search?: string, page = 1): Promise<PaginatedResponse<MyEquipment>> => {
  const response = await apiClient.post<ApiResponse<PaginatedResponse<MyEquipment>>>("/my-equipment/list", {
    search: search || undefined,
    page
  });
  return response.data.data;
};

export const fetchGeneralEquipmentList = async (search?: string, page = 1): Promise<PaginatedResponse<GeneralEquipment>> => {
  const response = await apiClient.post<ApiResponse<PaginatedResponse<GeneralEquipment>>>("/general-equipment/list", {
    search: search || undefined,
    page
  });
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

const DEFAULT_EQUIPMENT_PER_PAGE = Number(import.meta.env.VITE_EQUIPMENT_PER_PAGE ?? "12");

export const fetchAvailableRouteEquipment = async (routeId: number, page: number = 1, search: string = "", perPage: number = DEFAULT_EQUIPMENT_PER_PAGE): Promise<{ data: MyEquipment[], meta: PaginationMeta }> => {
  const response = await apiClient.post(`/routes/${routeId}/equipment/available-my`, {
    search: search || undefined,
    page,
    per_page: perPage
  });
  return { data: response.data.data.items, meta: response.data.data };
};