// UNFINISHED FILE FOR PREFETCHING

import { AUTH_TOKEN_KEY } from '../utils/auth';
import apiClient from "./apiClient";
import type { ApiResponse, PaginatedResponse } from "../types/general";

async function fetchAllPages<T>(url: string, baseParams: object = {}) {
  try {
    const firstRes = await apiClient.post<ApiResponse<PaginatedResponse<T>>>(url, {
      ...baseParams,
      page: 1
    });

    const paginated = firstRes?.data?.data;
    const total_pages = paginated?.total_pages ?? 0;

    if (total_pages > 1) {
      const remainingRequests = [];

      for (let p = 2; p <= total_pages; p++) {
        remainingRequests.push(
          apiClient.post(url, { ...baseParams, page: p })
        );
      }

      await Promise.allSettled(remainingRequests);
    }
  } catch (error) {
    console.error(`PWA: Chyba při fetchAllPages pro ${url}:`, error);
  }
}

export const runPwaPrefetch = async (): Promise<void> => {
  if (!navigator.onLine) return;

  const hasToken = !!localStorage.getItem(AUTH_TOKEN_KEY);

  if (!hasToken) return;

  try {
    const syncTasks = [
      fetchAllPages("/routes/list", { per_page: import.meta.env.VITE_ROUTES_PER_PAGE }),
      fetchAllPages("/routes/shared", { per_page: import.meta.env.VITE_ROUTES_PER_PAGE }),
      fetchAllPages("/my-equipment/list", { per_page: import.meta.env.VITE_EQUIPMENT_PER_PAGE })
    ];

    await Promise.all(syncTasks);
  } catch (error) {
  }
};