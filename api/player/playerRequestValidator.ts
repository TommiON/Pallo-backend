import { RequestHandler, Response } from "express";
import { ValidationError } from "../ValidationError";
import { sendErrorResponse } from "../ApiResponse";
import { PlayersByIdsRequest } from "./PlayerRequestResponseTypes";

export const getPlayersByIdsRequestValidator: RequestHandler<any, any, PlayersByIdsRequest> = (req, res, next) => {
    const errors: ValidationError[] = [];

    if (!req || !req.body.ids) {
        errors.push('MISSING_PARAMETERS');
    } else if (!Array.isArray(req.body.ids)) {
        errors.push('MALFORMATTED_PARAMETERS');
    } else if (!req.body.ids.every((id: any) => typeof id === 'number')) {
        errors.push('NON_NUMERIC_IDS');
    }

    if (errors.length > 0) {
        res.status(400).json(sendErrorResponse(errors));
    } else {
        next();
    }
}