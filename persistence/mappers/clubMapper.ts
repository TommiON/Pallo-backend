import Club from "../../domainModel/club/Club";
import type { ClubEntityData } from "../entities/ClubEntity";

export const fromClubEntity = (entity: ClubEntityData): Club => {
    const club = new Club();
    club.id = entity.id;
    club.name = entity.name;
    club.passwordHash = entity.passwordHash;
    club.established = entity.established;
    club.zombie = entity.zombie;
    return club;
};

export const toClubEntityData = (club: Club): ClubEntityData => {
    return {
        id: club.id,
        name: club.name,
        passwordHash: club.passwordHash,
        established: club.established,
        zombie: club.zombie
    };
};
