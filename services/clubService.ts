import Club from "../domainModel/club/Club";
import Player from "../domainModel/player/Player";
import { CLUB_NUMBER_OF_PLAYERS_AT_START } from "../domainProperties/domainProperties";
import { clubRepository, playerRepository } from "../persistence/repositories/repositories";

export const createClub = async(name: string, password: string): Promise<Club> => {
    const club = await Club.create(name, password);
    const savedClubEntity = await clubRepository.save(club.toEntity() as any);
    const savedClub = Club.fromEntity(savedClubEntity);

    const players: Player[] = [];
    for (let i = 0; i < CLUB_NUMBER_OF_PLAYERS_AT_START; i++) {
        const p = new Player();
        p.clubId = savedClub.id;
        p.club = savedClub;
        players.push(p);
    }

    const playerEntities = players.map(p => p.toEntity());
    await playerRepository.save(playerEntities as any);

    return savedClub;
};

export const findClubById = async (id: number): Promise<Club|null> => {
    const clubEntity = await clubRepository.findOne({
        where: { id },
        relations: ["players"]
    });

    if (!clubEntity) return null;
    return Club.fromEntity(clubEntity);
}

export const clubExistsForName = async (name: string): Promise<boolean> => {
    const club = await clubRepository.findOneBy({ name });
    return !!club;
}