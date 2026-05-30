import Player from "../domainCore/player/Player";
import { AuthenticatedUser } from "./authService";
import { createDefaultPlayerServicePorts } from "./composition/playerServiceComposition";
import { PlayerStorePort } from "./ports/playerPorts";

export interface PlayerResult {
    ownPlayers: Player[];
    othersPlayers: Player[];
}

export type PlayerServicePorts = {
    playerStore: PlayerStorePort;
};

export const createPlayerService = ({ playerStore }: PlayerServicePorts) => ({
    findPlayersByIds: async (ids: number[], authenticatedUser: AuthenticatedUser): Promise<PlayerResult> => {
        const players = await playerStore.findByIds(ids);

        return {
            ownPlayers: players.filter(p => p.clubId === authenticatedUser.clubId),
            othersPlayers: players.filter(p => p.clubId !== authenticatedUser.clubId)
        };
    }
});

const playerService = createPlayerService(createDefaultPlayerServicePorts());

export const findPlayersByIds = async (ids: number[], authenticatedUser: AuthenticatedUser): Promise<PlayerResult> => {
    return playerService.findPlayersByIds(ids, authenticatedUser);
}