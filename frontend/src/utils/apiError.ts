import { AxiosError } from "axios";

interface ApiErrorResponse {
    error_message?: string;
    message?: string;
    errors?: Record<string, string[]>;
}

/**
 * Parses an error object (typically from Axios) and returns a user-friendly error message.
 * @param error - The error object to parse.
 * @param defaultMessage - The fallback message if no specific error message is found.
 * @returns The error message string.
 */
export const getErrorMessage = (error: unknown, defaultMessage: string = "Došlo k neočekávané chybě"): string => {
    if (error instanceof AxiosError) {
        const data = error.response?.data as ApiErrorResponse | undefined;

        // Check for specific backend error structure based on user request
        if (data?.error_message) {
            return data.error_message;
        }

        // Fallback to standard message property
        if (data?.message) {
            // Sometimes message is generic "Request failed with status code 422", ignore that if we can?
            // But the user said "backend ti rovnou vyhodi seznam erroru jo, vypis tam presne to co vypsal backend."
            // The example showed 'message': "Request failed with status code 422" at the top level of AxiosError,
            // but in response.data it had error_message.
            return data.message;
        }
    } else if (error instanceof Error) {
        return error.message;
    }

    return defaultMessage;
};
