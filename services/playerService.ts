import { In } from "typeorm";

import Player from "../domainModel/player/Player";
import { playerRepository } from "../persistence/repositories/repositories";

export interface PlayerResult {
    ownPlayers: Player[];
    othersPlayers: Player[];
}

// kun saadaan clubId:t käyttöön, filtteröinti niiden perusteella (haetaan clubId:t relaatiolla kannasta)
export const findPlayersByIds = async (ids: number[]): Promise<PlayerResult> => {
    const players = await playerRepository.find({
        where: { id: In(ids)}
    });

    return {
        ownPlayers: players.filter(p => p.id !== 2),
        othersPlayers: players.filter(p => p.id === 2)
    };
}