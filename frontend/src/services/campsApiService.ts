import apiClient from "./apiClient";
import type { CampDetail } from "../types/mapViewer";

export const fetchCampDetail = async (id: number): Promise<CampDetail> => {
    const response = await apiClient.get<{ data: { camp: CampDetail } }>(`/camps/${id}`);
    return response.data.data.camp;
};
