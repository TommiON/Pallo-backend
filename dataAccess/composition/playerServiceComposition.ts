import { defaultPlayerStorePort } from "../../persistence/adapters/playerAdapters";
import { PlayerStorePort } from "../ports/playerPorts";

export type PlayerServicePorts = {
    playerStore: PlayerStorePort;
};

export const createDefaultPlayerServicePorts = (): PlayerServicePorts => {
    return {
        playerStore: defaultPlayerStorePort
    };
};
