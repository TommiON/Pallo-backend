import Player from "../domainCore/Player";
import { PlayerStorePort } from "./ports/playerPorts";

export interface PlayerResult {
    ownPlayers: Player[];
    othersPlayers: Player[];
}

export type PlayerServicePorts = {
    playerStore: PlayerStorePort;
};

export const createPlayerService = ({ playerStore }: PlayerServicePorts) => ({
    findPlayersByIds: async (ids: number[], clubId: number): Promise<PlayerResult> => {
        const players = await playerStore.findByIds(ids);

        return {
            ownPlayers: players.filter(p => p.club?.id === clubId),
            othersPlayers: players.filter(p => p.club?.id !== clubId)
        };
    }
});

type PlayerService = ReturnType<typeof createPlayerService>;

let playerService: PlayerService | null = null;

export const configurePlayerService = (ports: PlayerServicePorts): void => {
    playerService = createPlayerService(ports);
};

const getConfiguredPlayerService = (): PlayerService => {
    if (!playerService) {
        throw new Error("Player service not configured");
    }

    return playerService;
};

export const findPlayersByIds = async (ids: number[], clubId: number): Promise<PlayerResult> => {
    return getConfiguredPlayerService().findPlayersByIds(ids, clubId);
}