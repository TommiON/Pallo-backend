import { RequestHandler } from "express";
import { ValidationError } from "../ValidationError";
import { sendErrorResponse } from "../ApiResponse";
import { LeagueByQueryRequest } from "./LeagueRequestAndResponseTypes";

export const getLeaguesBySeasonRequestValidator: RequestHandler<any, any, LeagueByQueryRequest> = (req, res, next) => {
    const errors: ValidationError[] = [];
    
    if (req.body.season == null) {
            errors.push('MISSING_PARAMETERS');
    } else if ((req.body.divisionLevel == null && req.body.serialNumberOnDivisionLevel != null) 
        || (req.body.divisionLevel != null && req.body.serialNumberOnDivisionLevel == null)) {
            errors.push('MISSING_PARAMETERS')
    } else if (typeof req.body.season !== 'number' || (req.body.divisionLevel != null && typeof req.body.divisionLevel !== 'number') ||
        (req.body.serialNumberOnDivisionLevel != null && typeof req.body.serialNumberOnDivisionLevel !== 'number')) {
            errors.push('MALFORMATTED_PARAMETERS');
    }

    if (errors.length > 0) {
        res.status(400).json(sendErrorResponse(errors));
    } else {
        next();
    }   
}