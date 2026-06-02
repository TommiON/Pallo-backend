import jsonwebtoken from 'jsonwebtoken';
import { passwordMatches } from './controllerUtils';
import { findClubForAuthentication } from '../dataAccess/authService';

import environment from '../config/environment';

type AuthenticationResult = {
    usernameFound: boolean;
    passwordMatches?: boolean;
    authenticatedClubId?: number;
    token?: string;
}

export const authenticateLogin = async (clubname: string, password: string): Promise<AuthenticationResult> => {
    const club = await findClubForAuthentication(clubname);

    if (!club) {
        return {
            usernameFound: false,
            passwordMatches: undefined,
            authenticatedClubId: undefined,
            token: undefined
        }
    }

    const passwordMatch = await passwordMatches(password, club.passwordHash as string);

    if (!passwordMatch) {
        return {
            usernameFound: true,
            passwordMatches: false,
            authenticatedClubId: undefined,
            token: undefined
        }
    } else {
        return {
            usernameFound: true,
            passwordMatches: true,
            authenticatedClubId: club.id,
            token: generateToken({ clubName: club.name, clubId: club.id! })
        }
    }
}

export type AuthenticatedUser = {
    clubName: string;
    clubId: number;
}

export const generateToken = (user: AuthenticatedUser): string => {
    return jsonwebtoken.sign(user, environment.tokenSecret as string);
}