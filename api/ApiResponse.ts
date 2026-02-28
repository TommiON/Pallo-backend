import { ValidationError } from "./ValidationError";

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    errors?: ValidationError[];
}

export const sendSuccessResponse = <T>(data: T): ApiResponse<T> => {
    return {
        success: true,
        data,
    };
}

export const sendErrorResponse = (errorMessages: ValidationError[]): ApiResponse<never> => {
    return {
        success: false,
        errors: errorMessages,
    };
}