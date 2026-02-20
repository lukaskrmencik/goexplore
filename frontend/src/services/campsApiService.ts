import apiClient from "./apiClient";

interface CampDetailResponse {
    camp: any; // Type this better based on user data
}

export const fetchCampDetail = async (id: number) => {
    const response = await apiClient.get<{ data: CampDetailResponse }>(`/camps/${id}`);
    return response.data.data.camp;
};
