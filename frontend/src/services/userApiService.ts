import apiClient from "./apiClient";
import type { User } from "../types/users";

export const fetchMyProfile = async (): Promise<User> => {
    const res = await apiClient.get("/users/my");
    return res.data?.data?.user || res.data?.user;
};

export const updateMyProfile = async (data: { name: string }): Promise<User> => {
    const res = await apiClient.patch("/users/my", data);
    return res.data?.data?.user || res.data?.user;
};

export const uploadProfilePicture = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file); // Backend expects 'image'

    // Set headers explicitly for multipart/form-data, though Axios usually handles it
    const res = await apiClient.post("/users/my/profile-picture", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });

    // The backend `uploadProfilePicture` returns: response()->success(['path' => $path], 200);
    // Which gets wrapped by the standardized success response format in Laravel
    // So we just return the string path here to the component
    return res.data?.data?.path || res.data?.path;
};

export const deleteMyAccount = async () => {
    await apiClient.delete("/users/my");
};
