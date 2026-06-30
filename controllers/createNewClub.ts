import { createNewUserClub } from "../domainEngine/clubs/ClubCreator";
import { ClubData } from "../domainCore/Club";
import { persistNewClub } from "../dataAccess/clubService";
import type { ClubCreationPersistenceInput } from "../dataAccess/ports/clubPorts";
import { hashPassword } from "./controllerUtils";

export const createNewClub = async (name: string, password: string): Promise<ClubData> => {
    const createdClub = createNewUserClub(name);

    const createdClubWithPassword: ClubCreationPersistenceInput = {
        ...createdClub,
        passwordHash: await hashPassword(password)
    };

    return persistNewClub(createdClubWithPassword);
};