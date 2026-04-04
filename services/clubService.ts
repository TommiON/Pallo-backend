import Club from "../domainModel/club/Club";
import Player from "../domainModel/player/Player";
import appDataSource from "../config/datasource";
import { CLUB_NUMBER_OF_PLAYERS_AT_START } from "../domainProperties/domainProperties";
import { clubRepository, getTransactionalRepositories, playerRepository } from "../persistence/repositories/repositories";
import { eventNotifications } from "./eventNotifications";

/** Creates a new club, and also creates the starting players for that club. */
export const createClub = async(name: string, password: string): Promise<Club> => {
    const club = await Club.create(name, password);
    let savedClub: Club | null = null;

    await appDataSource.transaction(async (manager) => {
        const { clubRepository, playerRepository } = getTransactionalRepositories(manager);

        const savedClubEntity = await clubRepository.save(club.toEntity() as any);
        savedClub = Club.fromEntity(savedClubEntity);

        const players: Player[] = [];
        for (let i = 0; i < CLUB_NUMBER_OF_PLAYERS_AT_START; i++) {
            const p = new Player();
            p.clubId = savedClub.id;
            p.club = savedClub;
            players.push(p);
        }

        const playerEntities = players.map(p => p.toEntity());
        await playerRepository.save(playerEntities as any);
    });

    if (!savedClub) {
        throw new Error("Club creation transaction did not produce a saved club");
    }
    
    eventNotifications.emit("club.created", savedClub);

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

/** Finds all user clubs that are not attached to any league for the given season
 * @returns An array of club ids
*/
export const findNonAttachedUserClubs = async (currentSeason: number): Promise<number[]> => {
    const rawClubIds = await clubRepository
        .createQueryBuilder("club")
        .select("club.id", "id")
        .where("club.zombie = :zombie", { zombie: false })
        .andWhere((qb) => {
            const subQuery = qb
                .subQuery()
                .select("1")
                .from("league_clubs", "lc")
                .innerJoin("league", "league", "league.id = lc.league_id")
                .where("lc.club_id = club.id")
                .andWhere("league.season = :currentSeason")
                .getQuery();

            return `NOT EXISTS ${subQuery}`;
        })
        .setParameter("currentSeason", currentSeason)
        .getRawMany<{ id: number }>();

    return rawClubIds.map(club => Number(club.id));
}

/** Finds all user clubs that are attached to a league for the given season
 * @returns An array of club ids
 */
export const findAttachedUserClubs = async (currentSeason: number): Promise<number[]> => {
    const rawClubIds = await clubRepository
        .createQueryBuilder("club")
        .select("club.id", "id")
        .where("club.zombie = :zombie", { zombie: false })
        .andWhere((qb) => {
            const subQuery = qb
                .subQuery()
                .select("1")
                .from("league_clubs", "lc")
                .innerJoin("league", "league", "league.id = lc.league_id")
                .where("lc.club_id = club.id")
                .andWhere("league.season = :currentSeason")
                .getQuery();

            return `EXISTS ${subQuery}`;
        })
        .setParameter("currentSeason", currentSeason)
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

/** Removes all zombie clubs from database together with dependent rows.
 * @returns Number of zombie clubs removed
 */
export const removeAllZombieClubs = async (): Promise<number> => {
    const zombieClubIds = await findZombieClubs();

    if (zombieClubIds.length === 0) {
        return 0;
    }

    await appDataSource.transaction(async (manager) => {
        await manager
            .createQueryBuilder()
            .delete()
            .from("match_event")
            .where(
                "match_id IN (SELECT id FROM match WHERE home_club_id IN (:...zombieClubIds) OR away_club_id IN (:...zombieClubIds))"
            )
            .setParameter("zombieClubIds", zombieClubIds)
            .execute();

        await manager
            .createQueryBuilder()
            .delete()
            .from("match")
            .where("home_club_id IN (:...zombieClubIds)")
            .orWhere("away_club_id IN (:...zombieClubIds)")
            .setParameter("zombieClubIds", zombieClubIds)
            .execute();

        await manager
            .createQueryBuilder()
            .delete()
            .from("player")
            .where("club_id IN (:...zombieClubIds)")
            .setParameter("zombieClubIds", zombieClubIds)
            .execute();

        await manager
            .createQueryBuilder()
            .delete()
            .from("league_clubs")
            .where("club_id IN (:...zombieClubIds)")
            .setParameter("zombieClubIds", zombieClubIds)
            .execute();

        await manager
            .createQueryBuilder()
            .delete()
            .from("club")
            .where("id IN (:...zombieClubIds)")
            .setParameter("zombieClubIds", zombieClubIds)
            .execute();
    });

    return zombieClubIds.length;
}