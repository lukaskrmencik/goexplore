
export interface ApiResponse<T> {
    status: string
    status_code: number
    data: T
}