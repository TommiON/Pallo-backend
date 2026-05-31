import Player from "../../domainCore/Player";

export interface PlayerStorePort {
    findByIds(ids: number[]): Promise<Player[]>;
}
