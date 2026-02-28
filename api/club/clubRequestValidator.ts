import { RequestHandler } from "express";
import { ValidationError } from "../ValidationError";
import { sendErrorResponse } from "../ApiResponse";
import { CreateClubRequest, ClubByIdRequest } from "./ClubRequestResponseTypes";
import { clubExistsForName } from "../../services/clubService";

export const createClubRequestValidator: RequestHandler<any, any, CreateClubRequest> = async (req, res, next) => {
    const errors: ValidationError[] = [];

    if (!req.body.name || !req.body.password || !req.body.passwordConfirmation) {
        errors.push('MISSING_PARAMETERS');
    } else if (typeof req.body.name !== 'string' || typeof req.body.password !== 'string' || typeof req.body.passwordConfirmation !== 'string') {
        errors.push('MALFORMATTED_PARAMETERS');
    }
    
    const nameTaken: boolean = await clubExistsForName(req.body.name);
    if (nameTaken) {
        errors.push('CLUBNAME_ALREADY_TAKEN');
    } else if (req.body.name.length < 6) {
        errors.push('CLUBNAME_INSUFFICIENT');
    }
    
    if (req.body.password.length < 6) {
        errors.push('PASSWORD_INSUFFICIENT');
    } else if (req.body.password !== req.body.passwordConfirmation) {
        errors.push('PASSWORDS_DO_NOT_MATCH');
    }

    if (errors.length > 0) {
        res.status(400).json(sendErrorResponse(errors));
    } else {
        next();
    }
}

export const getClubByIdRequestValidator: RequestHandler<any, any, ClubByIdRequest> = (req, res, next) => {
    const errors: ValidationError[] = [];
    
    if (!req.body.id) {
        errors.push('MISSING_PARAMETERS');
    } else if (typeof req.body.id !== 'number') {
        errors.push('MALFORMATTED_PARAMETERS');
    }

    if (errors.length > 0) {
        res.status(400).json(sendErrorResponse(errors));
    } else {
        next();
    }   
}