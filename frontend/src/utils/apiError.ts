import { AxiosError } from "axios";
import type { ApiErrorResponse } from "../types/general";

/**
 * Parses an error object (typically from Axios) and returns a user-friendly error message.
 * @param error - The error object to parse.
 * @param defaultMessage - The fallback message if no specific error message is found.
 * @returns The error message string.
 */
export const getErrorMessage = (error: unknown, defaultMessage: string = "Došlo k neočekávané chybě"): string => {
    if (error instanceof AxiosError) {
        const data = error.response?.data as ApiErrorResponse | undefined;

        if (data?.error_message) {
            return data.error_message;
        }

        if (data?.message) {
            return data.message;
        }
    } else if (error instanceof Error) {
        return error.message;
    }

    return defaultMessage;
};
