import Club from "../domainModel/club/Club";
import Player from "../domainModel/player/Player";
import { CLUB_NUMBER_OF_PLAYERS_AT_START } from "../domainProperties/domainProperties";
import { clubRepository, playerRepository } from "../persistence/repositories/repositories";

/** Creates a new club, and also creates the starting players for that club. */
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

/**
 * Finds a club by its id, including the players that belong to that club
 * TODO: remove relations from this function and create a separate function for fetching the players of a club,
 * because clubs will have all kinds of stuff related (finances, staff, etc)
 */
export const findClubById = async (id: number): Promise<Club|null> => {
    const clubEntity = await clubRepository.findOne({
        where: { id },
        relations: ["players"]
    });

    if (!clubEntity) return null;
    return Club.fromEntity(clubEntity);
}

/** Checks if a club with the given name already exists in the database */
export const clubExistsForName = async (name: string): Promise<boolean> => {
    const club = await clubRepository.findOneBy({ name });
    return !!club;
}

/** Finds all clubs that are not attached to any league
 * @returns An array of club ids
*/
export const findNonAttachedClubs = async (): Promise<number[]> => {
    const rawClubIds = await clubRepository
        .createQueryBuilder("club")
        .select("club.id", "id")
        .where((qb) => {
            const subQuery = qb
                .subQuery()
                .select("1")
                .from("league_clubs", "lc")
                .where("lc.club_id = club.id")
                .getQuery();

            return `NOT EXISTS ${subQuery}`;
        })
        .getRawMany<{ id: number }>();

    return rawClubIds.map(club => Number(club.id));
}

/** Finds all clubs that are marked as zombies
 * @returns An array of club ids
 */
export const findZombieClubs = async (): Promise<number[]> => {
    const rawClubIds = await clubRepository
        .createQueryBuilder("club")
        .select("club.id", "id")
        .where("club.zombie = :zombie", { zombie: true })
        .getRawMany<{ id: number }>();

    return rawClubIds.map(club => Number(club.id));
}