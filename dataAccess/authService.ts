import { createDefaultAuthServicePorts } from "./composition/authServiceComposition";
import { AuthClubRecord, AuthStorePort } from "./ports/authPorts";

export type AuthServicePorts = {
    authStore: AuthStorePort;
};

export const createAuthService = ({ authStore }: AuthServicePorts) => ({
    findClubForAuthentication: async (clubName: string): Promise<AuthClubRecord | null> => {
        return authStore.findClubForAuthentication(clubName);
    }
});

const authService = createAuthService(createDefaultAuthServicePorts());

export const findClubForAuthentication = async (clubName: string): Promise<AuthClubRecord | null> => {
    return authService.findClubForAuthentication(clubName);
};