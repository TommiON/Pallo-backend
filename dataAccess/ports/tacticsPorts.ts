import Tactics from "../../domainCore/Tactics";

export interface TacticsStorePort {
    save(tactics: Tactics): Promise<Tactics>;
    findById(id: number): Promise<Tactics | null>;
}

export interface TacticsTransactionPort {
    runInTransaction<T>(operation: (store: TacticsStorePort) => Promise<T>): Promise<T>;
}