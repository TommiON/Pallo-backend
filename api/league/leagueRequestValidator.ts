import { RequestHandler } from "express";
import { ValidationError } from "../ValidationError";
import { sendErrorResponse } from "../ApiResponse";

export const getLeaguesBySeasonRequestValidator: RequestHandler<any, any, { season: number }> = (req, res, next) => {
    const errors: ValidationError[] = [];
    
    if (req.body.season == null || req.body.season === undefined) {
        errors.push('MISSING_PARAMETERS');
    } else if (typeof req.body.season !== 'number') {
        errors.push('MALFORMATTED_PARAMETERS');
    }

    if (errors.length > 0) {
        res.status(400).json(sendErrorResponse(errors));
    } else {
        next();
    }   
}