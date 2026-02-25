import apiClient from "./apiClient";
import type { User } from "../types/users";
import type { ApiResponse } from "../types/general";

export const fetchMyUser = async (): Promise<User> => {
    try {
        const response = await apiClient.get<ApiResponse<{ user: User }>>("/users/my");
        return response.data.data.user;
    } catch (error) {
        throw error;
    }
};
export const updateUserLocation = async (lng: number, lat: number): Promise<void> => {
    try {
        await apiClient.patch("/users/my/location", {
            location: {
                coordinates: [lng, lat]
            }
        });
    } catch (error) {
        throw error;
    }
};
