import apiClient from "./apiClient";


interface PoiDetailResponse {
    poi: any; // Type this better based on user data
}

export const fetchPoiDetail = async (id: number) => {
    const response = await apiClient.get<{ data: PoiDetailResponse }>(`/poi/${id}`);
    return response.data.data.poi;
};
