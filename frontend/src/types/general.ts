export interface ApiResponse<T> {
    status: string
    status_code: number
    data: T
}

export interface PaginatedResponse<T> {
    page: number;
    per_page: number;
    total_pages: number;
    total_items: number;
    items: T[];
}

export interface ApiErrorResponse {
    error_message?: string;
    message?: string;
    errors?: Record<string, string[]>;
}
