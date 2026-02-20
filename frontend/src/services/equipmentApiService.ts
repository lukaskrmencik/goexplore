import apiClient from "./apiClient";
import type { GeneralEquipment, MyEquipment } from "../types/equipment";

export const fetchGeneralEquipment = async (
    page: number = 1,
    search: string = ""
): Promise<{ data: GeneralEquipment[], meta: any }> => {
    const response = await apiClient.post('/general-equipment/list', {
        page,
        search: search || undefined
    });
    return { data: response.data.data.items, meta: response.data.data };
};

export const fetchMyEquipment = async (
    page: number = 1,
    search: string = ""
): Promise<{ data: MyEquipment[], meta: any }> => {
    const response = await apiClient.post('/my-equipment/list', {
        page,
        search: search || undefined
    });
    return { data: response.data.data.items, meta: response.data.data };
};

export const createMyEquipment = async (data: {
    name: string;
    general_equipment_id: number;
    specifications: Record<string, any>;
}): Promise<MyEquipment> => {
    const response = await apiClient.post('/my-equipment', data);
    return response.data.data.my_equipment;
};

export const updateMyEquipment = async (id: number, data: {
    name?: string;
    specifications?: Record<string, any>;
}): Promise<MyEquipment> => {
    const response = await apiClient.patch(`/my-equipment/${id}`, data);
    return response.data.data.my_equipment;
};

export const deleteMyEquipment = async (id: number): Promise<void> => {
    await apiClient.delete(`/my-equipment/${id}`);
};

import axios from "axios";

export const uploadEquipmentImage = async (id: number, file: File): Promise<{ path: string }> => {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem("token");

    const response = await axios.post(`${import.meta.env.VITE_API_URL}/my-equipment/${id}/image`, formData, {
        headers: {
            'Authorization': `Bearer ${token}`
        },
    });
    return response.data.data;
};
