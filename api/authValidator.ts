import { RequestHandler } from "express";
import jsonwebtoken from 'jsonwebtoken';

import environment from '../config/environment';
import { ValidationError } from "./ValidationError";
import { sendErrorResponse } from "./ApiResponse";
import { AuthenticatedUser } from "../services/authService";

export const authValidator: RequestHandler<{}, any, any, any> = (req, res, next) => {
    const errors: ValidationError[] = [];
    let authenticatedUser: AuthenticatedUser;

    const authenticationHeader = req.get('authorization');

    if (!authenticationHeader) {
        errors.push('TOKEN_MISSING');
    } else if (typeof authenticationHeader !== 'string' || !authenticationHeader.toLowerCase().startsWith('bearer')) {
        errors.push('TOKEN_MALFORMATTED');
    } else {
        const token = authenticationHeader.split(' ')[1];
        const secret = environment.tokenSecret as string;

        try {
            const decodedToken = jsonwebtoken.verify(token, secret);

            authenticatedUser = {
                clubId: (decodedToken as any).clubId,
                clubName: (decodedToken as any).clubName
            };
            
            // send authenticated user down the chain for further use in the request handling
            res.locals.authenticatedUser = authenticatedUser;
            
            next();

        } catch (error) {
            errors.push('TOKEN_DOES_NOT_MATCH');
        }
    }

    if (errors.length > 0) {
        res.status(401).json(sendErrorResponse(errors));
    }
}