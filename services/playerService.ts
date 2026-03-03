import { In } from "typeorm";

import Player from "../domainModel/player/Player";
import { playerRepository } from "../persistence/repositories/repositories";
import { AuthenticatedUser } from "./authService";

export interface PlayerResult {
    ownPlayers: Player[];
    othersPlayers: Player[];
}

export const findPlayersByIds = async (ids: number[], authenticatedUser: AuthenticatedUser): Promise<PlayerResult> => {
    const players = await playerRepository.find({
        where: { id: In(ids)}
    });

    return {
        ownPlayers: players.filter(p => p.clubId === authenticatedUser.clubId),
        othersPlayers: players.filter(p => p.clubId !== authenticatedUser.clubId)
    };
}