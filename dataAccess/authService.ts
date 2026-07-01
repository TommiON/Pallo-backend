import { AuthClubRecord, AuthStorePort } from "./ports/authPorts";

/**
 * Finds a club for authentication purposes by its name. Returns the club record if found, otherwise returns null.
 */
export const findClubForAuthentication = async (clubName: string): Promise<AuthClubRecord | null> => {
    return getConfiguredAuthService().findClubForAuthentication(clubName);
};


export type AuthServicePorts = {
    authStore: AuthStorePort;
};

export const createAuthService = ({ authStore }: AuthServicePorts) => ({
    findClubForAuthentication: async (clubName: string): Promise<AuthClubRecord | null> => {
        return authStore.findClubForAuthentication(clubName);
    }
});

type AuthService = ReturnType<typeof createAuthService>;

let authService: AuthService | null = null;

export const configureAuthService = (ports: AuthServicePorts): void => {
    authService = createAuthService(ports);
};

const getConfiguredAuthService = (): AuthService => {
    if (!authService) {
        throw new Error("Auth service not configured");
    }

    return authService;
};