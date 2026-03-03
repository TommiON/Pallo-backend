import { RequestHandler } from "express";
import { ValidationError } from "../ValidationError";
import { sendErrorResponse } from "../ApiResponse";
import { LoginRequest } from "./LoginRequestResponseTypes";
import { authenticateLogin } from "../../services/authService";

export const loginRequestValidator: RequestHandler<any, any, LoginRequest> = async (req, res, next) => {
    const errors: ValidationError[] = [];

    if (!req.body.clubName || !req.body.password) {
        errors.push('MISSING_PARAMETERS');
    } else if (typeof req.body.clubName !== 'string' || typeof req.body.password !== 'string') {
        errors.push('MALFORMATTED_PARAMETERS');
    } else {
        const authenticationResult = await authenticateLogin(req.body.clubName, req.body.password);

        if (!authenticationResult.usernameFound) {
            errors.push('CLUBNAME_NOT_FOUND');
        } else if (!authenticationResult.passwordMatches) {
            errors.push('PASSWORD_DOES_NOT_MATCH');
        } else {
            // success: send clubId further down then chain for token generation
            res.locals.authenticatedClubId = authenticationResult.authenticatedClubId;
        }
    }

    if (errors.length > 0) {
        res.status(400).json(sendErrorResponse(errors));
    } else {
        next();
    }
}