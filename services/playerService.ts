import { In } from "typeorm";

import Player from "../domainModel/player/Player";
import { playerRepository } from "../persistence/repositories/repositories";
import type { PlayerEntityData } from "../persistence/entities/PlayerEntity";
import { AuthenticatedUser } from "./authService";

export interface PlayerResult {
    ownPlayers: Player[];
    othersPlayers: Player[];
}

export const findPlayersByIds = async (ids: number[], authenticatedUser: AuthenticatedUser): Promise<PlayerResult> => {
    const playerEntities = await playerRepository.find({
        where: { id: In(ids)}
    });

    const players = playerEntities.map(entity => Player.fromEntity(entity));

    return {
        ownPlayers: players.filter(p => p.clubId === authenticatedUser.clubId),
        othersPlayers: players.filter(p => p.clubId !== authenticatedUser.clubId)
    };
}