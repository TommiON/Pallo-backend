import Club from "../domainCore/Club";
import { ClubEventsPort, ClubCreationPersistenceInput, ClubStorePort, ClubTransactionPort } from "./ports/clubPorts";

export type ClubServicePorts = {
    clubStore: ClubStorePort;
    clubTransaction: ClubTransactionPort;
    clubEvents: ClubEventsPort;
};

export const createClubService = ({ clubStore, clubTransaction, clubEvents }: ClubServicePorts) => ({
    persistNewClub: async (newClub: ClubCreationPersistenceInput): Promise<Club> => {
        const savedClub = await clubTransaction.runInTransaction(async (transactionalStore) => {
            const persistedClub = await transactionalStore.saveCreatedClub(newClub.club, newClub.passwordHash);
            const players = newClub.players.map((player) => ({
                ...player,
                clubId: persistedClub.id,
                club: persistedClub
            }));

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

type ClubService = ReturnType<typeof createClubService>;

let clubService: ClubService | null = null;

export const configureClubService = (ports: ClubServicePorts): void => {
    clubService = createClubService(ports);
};

const getConfiguredClubService = (): ClubService => {
    if (!clubService) {
        throw new Error("Club service not configured");
    }

    return clubService;
};

export const persistNewClub = async (newClub: ClubCreationPersistenceInput): Promise<Club> => {
    return getConfiguredClubService().persistNewClub(newClub);
};

/**
 * Finds a club by its id, including the players that belong to that club
 * TODO: remove relations from this function and create a separate function for fetching the players of a club,
 * because clubs will have all kinds of stuff related (finances, staff, etc)
 */
export const findClubById = async (id: number): Promise<Club|null> => {
    return getConfiguredClubService().findClubById(id);
}

/** Checks if a club with the given name already exists in the database */
export const clubExistsForName = async (name: string): Promise<boolean> => {
    return getConfiguredClubService().clubExistsForName(name);
}

/** Finds all user clubs that are not attached to any league for the given season
 * @returns An array of club ids
*/
export const findNonAttachedUserClubs = async (currentSeason: number): Promise<number[]> => {
    return getConfiguredClubService().findNonAttachedUserClubs(currentSeason);
}

/** Finds all user clubs that are attached to a league for the given season
 * @returns An array of club ids
 */
export const findAttachedUserClubs = async (currentSeason: number): Promise<number[]> => {
    return getConfiguredClubService().findAttachedUserClubs(currentSeason);
}

/** Finds all clubs that are marked as zombies
 * @returns An array of club ids
 */
export const findZombieClubs = async (): Promise<number[]> => {
    return getConfiguredClubService().findZombieClubs();
}

/** Removes all zombie clubs from database together with dependent rows.
 * @returns Number of zombie clubs removed
 */
export const removeAllZombieClubs = async (): Promise<number> => {
    return getConfiguredClubService().removeAllZombieClubs();
}