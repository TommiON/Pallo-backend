import Club from "../../domainCore/Club";
import type { ClubEntityData } from "../entities/ClubEntity";

export const fromClubEntity = (entity: ClubEntityData): Club => {
    const club = new Club(entity.name, entity.zombie);
    club.id = entity.id;
    club.established = entity.established;
    return club;
};

export const toClubEntityData = (club: Club, passwordHash?: string): ClubEntityData => {
    return {
        id: club.id,
        name: club.name,
        passwordHash,
        established: club.established,
        zombie: club.zombie
    };
};
