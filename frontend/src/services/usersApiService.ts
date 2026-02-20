
import apiClient from "./apiClient";
import type { User } from "../types/users";

interface FetchMyUserResponse {
    status: string;
    status_code: number;
    data: {
        user: User;
    };
}

export const fetchMyUser = async (): Promise<User> => {
    try {
        const response = await apiClient.get<FetchMyUserResponse>("/users/my");
        return response.data.data.user;
    } catch (error) {
        throw error;
    }
};
