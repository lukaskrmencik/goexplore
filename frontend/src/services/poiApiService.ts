import apiClient from "./apiClient";
import type { PoiDetail } from "../types/mapViewer";

export const fetchPoiDetail = async (id: number): Promise<PoiDetail> => {
    const response = await apiClient.get<{ data: { poi: PoiDetail } }>(`/poi/${id}`);
    return response.data.data.poi;
};
