import { AuthClubRecord, AuthStorePort } from "../../dataAccess/ports/authPorts";
import { clubRepository } from "../repositories/repositories";

export const defaultAuthStorePort: AuthStorePort = {
    findClubForAuthentication: async (clubName: string): Promise<AuthClubRecord | null> => {
        const club = await clubRepository.findOneBy({ name: clubName });

        if (!club || !club.id || !club.passwordHash) {
            return null;
        }

        return {
            id: club.id,
            name: club.name,
            passwordHash: club.passwordHash
        };
    }
};
