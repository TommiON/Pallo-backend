import type { ClubData } from "../../domainCore/club/ClubData";

export type ClubResponse = Omit<ClubData, "passwordHash"> | null;

export type CreateClubRequest = {
    name: string;
    password: string;
    passwordConfirmation: string;
}

export type ClubByIdRequest = {
    id: number;
}