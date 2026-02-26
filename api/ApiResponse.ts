export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export const sendSuccessResponse = <T>(data: T): ApiResponse<T> => {
    return {
        success: true,
        data,
    };
}

export const sendErrorResponse = (errorMessage: string): ApiResponse<never> => {
    return {
        success: false,
        error: errorMessage,
    };
}