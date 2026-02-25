import { In } from "typeorm";

import Player from "../domainModel/player/Player";
import { playerRepository } from "../persistence/repositories/repositories";

export const findPlayersByIds = async (ids: number[]): Promise<Player[]> => {
    return await playerRepository.find({
        where: { id: In(ids)}
    });
}