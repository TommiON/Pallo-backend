import { ClubCreationResult, createNewUserClub } from "../domainEngine/clubs/ClubCreator";
import { hashPassword } from "./controllerUtils";
import { persistNewClub } from "../dataAccess/clubService";
// onko hyvä palauttaa DomainObjecteja täältä?
import Club, { ClubData } from "../domainCore/Club";

export const newUserClub = async (name: string, password: string): Promise<ClubData> => {
    const createdClub: ClubCreationResult = createNewUserClub(name);

    const createdClubWithPassword = {
        ...createdClub,
        passwordHash: await hashPassword(password)
    };

    return persistNewClub(createdClubWithPassword);
};