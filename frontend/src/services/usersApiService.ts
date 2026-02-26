import apiClient from "./apiClient";
import type { User } from "../types/users";
import type { ApiResponse } from "../types/general";

export const fetchMyUser = async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<{ user: User }>>("/users/my");
    return response.data.data.user;
};

export const updateUserLocation = async (lng: number, lat: number): Promise<void> => {
    await apiClient.patch("/users/my/location", {
        location: {
            coordinates: [lng, lat],
        },
    });
};

export const updateMyProfile = async (data: { name: string }): Promise<User> => {
    const res = await apiClient.patch("/users/my", data);
    return res.data?.data?.user || res.data?.user;
};

export const uploadProfilePicture = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await apiClient.post("/users/my/profile-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data?.data?.path || res.data?.path;
};

export const deleteMyAccount = async () => {
    await apiClient.delete("/users/my");
};
