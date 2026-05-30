import Club from "../domainCore/club/Club";
import Player from "../domainCore/Player";
import { CLUB_NUMBER_OF_PLAYERS_AT_START } from "../domainCore/domainProperties";
import { createDefaultClubServicePorts } from "./composition/clubServiceComposition";
import { ClubEventsPort, ClubStorePort, ClubTransactionPort } from "./ports/clubPorts";

export type ClubServicePorts = {
    clubStore: ClubStorePort;
    clubTransaction: ClubTransactionPort;
    clubEvents: ClubEventsPort;
};

export const createClubService = ({ clubStore, clubTransaction, clubEvents }: ClubServicePorts) => ({
    createClub: async (name: string, password: string): Promise<Club> => {
        const club = await Club.create(name, password);

        const savedClub = await clubTransaction.runInTransaction(async (transactionalStore) => {
            const persistedClub = await transactionalStore.save(club);

            const players: Player[] = [];
            for (let i = 0; i < CLUB_NUMBER_OF_PLAYERS_AT_START; i++) {
                const player = new Player();
                player.clubId = persistedClub.id;
                player.club = persistedClub;
                players.push(player);
            }

            await transactionalStore.savePlayers(players);
            return persistedClub;
        });

        clubEvents.emitClubCreated(savedClub);
        return savedClub;
    },

    findClubById: async (id: number): Promise<Club | null> => {
        return clubStore.findByIdWithPlayers(id);
    },

    clubExistsForName: async (name: string): Promise<boolean> => {
        return clubStore.existsForName(name);
    },

    findNonAttachedUserClubs: async (currentSeason: number): Promise<number[]> => {
        return clubStore.findNonAttachedUserClubIds(currentSeason);
    },

    findAttachedUserClubs: async (currentSeason: number): Promise<number[]> => {
        return clubStore.findAttachedUserClubIds(currentSeason);
    },

    findZombieClubs: async (): Promise<number[]> => {
        return clubStore.findZombieClubIds();
    },

    removeAllZombieClubs: async (): Promise<number> => {
        const zombieClubIds = await clubStore.findZombieClubIds();

        if (zombieClubIds.length === 0) {
            return 0;
        }

        await clubTransaction.runInTransaction(async (transactionalStore) => {
            await transactionalStore.removeZombieClubsGraph(zombieClubIds);
            return undefined;
        });

        return zombieClubIds.length;
    }
});

const clubService = createClubService(createDefaultClubServicePorts());

/** Creates a new club, and also creates the starting players for that club. */
export const createClub = async(name: string, password: string): Promise<Club> => {
    return clubService.createClub(name, password);
};

/**
 * Finds a club by its id, including the players that belong to that club
 * TODO: remove relations from this function and create a separate function for fetching the players of a club,
 * because clubs will have all kinds of stuff related (finances, staff, etc)
 */
export const findClubById = async (id: number): Promise<Club|null> => {
    return clubService.findClubById(id);
}

/** Checks if a club with the given name already exists in the database */
export const clubExistsForName = async (name: string): Promise<boolean> => {
    return clubService.clubExistsForName(name);
}

/** Finds all user clubs that are not attached to any league for the given season
 * @returns An array of club ids
*/
export const findNonAttachedUserClubs = async (currentSeason: number): Promise<number[]> => {
    return clubService.findNonAttachedUserClubs(currentSeason);
}

/** Finds all user clubs that are attached to a league for the given season
 * @returns An array of club ids
 */
export const findAttachedUserClubs = async (currentSeason: number): Promise<number[]> => {
    return clubService.findAttachedUserClubs(currentSeason);
}

/** Finds all clubs that are marked as zombies
 * @returns An array of club ids
 */
export const findZombieClubs = async (): Promise<number[]> => {
    return clubService.findZombieClubs();
}

/** Removes all zombie clubs from database together with dependent rows.
 * @returns Number of zombie clubs removed
 */
export const removeAllZombieClubs = async (): Promise<number> => {
    return clubService.removeAllZombieClubs();
}