import { In, Repository } from "typeorm";

import { PlayerStorePort } from "../../services/ports/playerPorts";
import { PlayerEntityData } from "../entities/PlayerEntity";
import { fromPlayerEntity } from "../mappers/playerMapper";
import { playerRepository } from "../repositories/repositories";

const createPlayerStoreFromRepository = (repository: Repository<PlayerEntityData>): PlayerStorePort => ({
    findByIds: async (ids) => {
        const playerEntities = await repository.find({
            where: { id: In(ids) }
        });

        return playerEntities.map((entity) => fromPlayerEntity(entity));
    }
});

export const defaultPlayerStorePort: PlayerStorePort = createPlayerStoreFromRepository(playerRepository);
