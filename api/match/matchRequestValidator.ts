import { RequestHandler } from "express";
import { ValidationError } from "../ValidationError";
import { sendErrorResponse } from "../ApiResponse";
import { MatchReportByIdRequest } from "./MatchRequestAndResponseTypes";

export const getMatchReportByIdValidator: RequestHandler<MatchReportByIdRequest> = (req, res, next) => {
    let errors: ValidationError[] = [];

    const id = Number.parseInt(req.params.id);

    if (isNaN(id)) {
        errors.push('NON_NUMERIC_IDS');
    } else if (!id) {
        errors.push('MISSING_PARAMETERS');
    }

    if (errors.length > 0) {
        res.status(400).json(sendErrorResponse(errors));
    } else {
        next();
    }
};