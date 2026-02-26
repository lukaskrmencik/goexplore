import { AxiosError } from "axios";
import type { ApiErrorResponse } from "../types/general";

export const getErrorMessage = (error: unknown, defaultMessage: string = "Došlo k neočekávané chybě"): string => {
    if (error instanceof AxiosError) {
        const data = error.response?.data as ApiErrorResponse | undefined;

        if (data?.errors) {
            const firstFieldErrors = Object.values(data.errors)[0];
            if (firstFieldErrors?.length > 0) return firstFieldErrors[0];
        }

        if (data?.error_message) return data.error_message;
        if (data?.message) return data.message;
    } else if (error instanceof Error) {
        return error.message;
    }

    return defaultMessage;
};
