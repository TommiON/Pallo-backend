import jsonwebtoken from 'jsonwebtoken';

import environment from '../config/environment';
import { clubRepository } from '../persistence/repositories/repositories';
import { passwordMatches } from '../utils/passwordUtils';

type AuthenticationResult = {
    usernameFound: boolean;
    passwordMatches?: boolean;
    authenticatedClubId?: number;
}

export const authenticateLogin = async (clubname: string, password: string): Promise<AuthenticationResult> => {
    const club = await clubRepository.findOneBy({ name: clubname });

    if (!club) {
        return {
            usernameFound: false,
            passwordMatches: undefined,
            authenticatedClubId: undefined
        }
    }

    const passwordMatch = await passwordMatches(password, club.passwordHash as string);

    if (passwordMatch) {
        return {
            usernameFound: true,
            passwordMatches: true,
            authenticatedClubId: club.id
        }
    } else {
        return {
            usernameFound: true,
            passwordMatches: false,
            authenticatedClubId: undefined
        }
    }
}

type AuthenticatedUser = {
    clubName: string;
    clubId: number;
}

export const generateToken = (user: AuthenticatedUser): string => {
    return jsonwebtoken.sign(user, environment.tokenSecret as string);
}