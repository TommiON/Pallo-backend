import Tactics, { MatchSide } from "../../domainCore/Tactics";

export interface TacticsStorePort {
    saveForMatch(matchId: number, side: MatchSide, tactics: Tactics): Promise<Tactics>;
    findById(id: number): Promise<Tactics | null>;
    findByMatchIdAndSide(matchId: number, side: MatchSide): Promise<Tactics | null>;
    findByMatchId(matchId: number): Promise<Tactics[]>;
    lockForMatch(matchId: number, side: MatchSide): Promise<void>;
}

export interface TacticsTransactionPort {
    runInTransaction<T>(operation: (store: TacticsStorePort) => Promise<T>): Promise<T>;
}