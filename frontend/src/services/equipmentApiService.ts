import axios from "axios";
import apiClient from "./apiClient";
import type { GeneralEquipment, MyEquipment } from "../types/equipment";
import type { PaginationMeta } from "../types/general";
import { AUTH_TOKEN_KEY } from "../utils/auth";

const DEFAULT_EQUIPMENT_PER_PAGE = Number(import.meta.env.VITE_EQUIPMENT_PER_PAGE ?? "12");

export const fetchGeneralEquipment = async (
    page: number = 1,
    search: string = "",
    perPage: number = DEFAULT_EQUIPMENT_PER_PAGE
): Promise<{ data: GeneralEquipment[], meta: PaginationMeta }> => {
    const response = await apiClient.post('/general-equipment/list', {
        page,
        per_page: perPage,
        search: search || undefined
    });
    return { data: response.data.data.items, meta: response.data.data };
};

export const fetchMyEquipment = async (
    page: number = 1,
    search: string = "",
    perPage: number = DEFAULT_EQUIPMENT_PER_PAGE
): Promise<{ data: MyEquipment[], meta: PaginationMeta }> => {
    const response = await apiClient.post('/my-equipment/list', {
        page,
        per_page: perPage,
        search: search || undefined
    });
    return { data: response.data.data.items, meta: response.data.data };
};

export const createMyEquipment = async (data: {
    name: string;
    general_equipment_id: number;
    specifications: Record<string, unknown>;
}): Promise<MyEquipment> => {
    const response = await apiClient.post('/my-equipment', data);
    return response.data.data.my_equipment;
};

export const updateMyEquipment = async (id: number, data: {
    name?: string;
    specifications?: Record<string, unknown>;
}): Promise<MyEquipment> => {
    const response = await apiClient.patch(`/my-equipment/${id}`, data);
    return response.data.data.my_equipment;
};

export const deleteMyEquipment = async (id: number): Promise<void> => {
    await apiClient.delete(`/my-equipment/${id}`);
};

export const uploadEquipmentImage = async (id: number, file: File): Promise<{ path: string }> => {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem(AUTH_TOKEN_KEY);

    const response = await axios.post(`${import.meta.env.VITE_API_URL}/my-equipment/${id}/image`, formData, {
        headers: {
            'Authorization': `Bearer ${token}`
        },
    });
    return response.data.data;
};
