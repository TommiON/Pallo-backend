import { ClubCreationResult, createNewUserClub } from "../domainEngine/clubs/ClubCreator";
import { hashPassword } from "./passwordUtils";
import { persistNewClub } from "../dataAccess/clubService";

export const newUserClub = async (name: string, password: string) => {
    const createdClub: ClubCreationResult = createNewUserClub(name);

    const createdClubWithPassword = {
        ...createdClub,
        passwordHash: await hashPassword(password)
    };

    return persistNewClub(createdClubWithPassword);

};