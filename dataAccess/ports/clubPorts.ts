import Club from "../../domainCore/club/Club";
import Player from "../../domainCore/Player";

export interface ClubStorePort {
    save(club: Club): Promise<Club>;
    findByIdWithPlayers(id: number): Promise<Club | null>;
    existsForName(name: string): Promise<boolean>;
    findNonAttachedUserClubIds(currentSeason: number): Promise<number[]>;
    findAttachedUserClubIds(currentSeason: number): Promise<number[]>;
    findZombieClubIds(): Promise<number[]>;
}

export interface ClubTransactionalStorePort extends ClubStorePort {
    savePlayers(players: Player[]): Promise<void>;
    removeZombieClubsGraph(zombieClubIds: number[]): Promise<void>;
}

export interface ClubTransactionPort {
    runInTransaction<T>(operation: (store: ClubTransactionalStorePort) => Promise<T>): Promise<T>;
}

export interface ClubEventsPort {
    emitClubCreated(club: Club): void;
}
