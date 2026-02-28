import Club from "../../domainModel/club/Club";

export type ClubResponse = Omit<Club, "passwordHash"> | null;

export type CreateClubRequest = {
    name: string;
    password: string;
    passwordConfirmation: string;
}

export type ClubByIdRequest = {
    id: number;
}