export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    errors?: string[];
}

export const sendSuccessResponse = <T>(data: T): ApiResponse<T> => {
    return {
        success: true,
        data,
    };
}

export const sendErrorResponse = (errorMessages: string[]): ApiResponse<never> => {
    return {
        success: false,
        errors: errorMessages,
    };
}