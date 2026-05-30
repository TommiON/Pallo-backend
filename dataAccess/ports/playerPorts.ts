import Player from "../../domainModel/player/Player";

export interface PlayerStorePort {
    findByIds(ids: number[]): Promise<Player[]>;
}
