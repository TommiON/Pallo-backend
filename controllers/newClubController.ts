import { ClubCreationResult, createNewUserClub } from "../domainEngine/clubs/ClubCreator";
import { ClubData } from "../domainCore/Club";
import { persistNewClub } from "../dataAccess/clubService";
import { hashPassword } from "./controllerUtils";

export const newUserClub = async (name: string, password: string): Promise<ClubData> => {
    const createdClub: ClubCreationResult = createNewUserClub(name);

    const createdClubWithPassword = {
        ...createdClub,
        passwordHash: await hashPassword(password)
    };

    return persistNewClub(createdClubWithPassword);
};