import { Repository } from "typeorm";
import { StandingStorePort } from "../../dataAccess/ports/standingPorts";
import { StandingEntityData } from "../entities/StandingEntity";
import { standingRepository } from "../repositories/repositories";
import { fromStandingEntity, toStandingEntityData } from "../mappers/standingMapper";


const createStandingStoreFromRepository = (repository: Repository<StandingEntityData>): StandingStorePort => ({
    save: async (standing) => {
        const savedEntity = await repository.save(toStandingEntityData(standing) as any);
        return fromStandingEntity(savedEntity);
    },

    findByLeagueIdAndWeek: async (leagueId, week) => {
        const entities = await repository.find({
            where: { leagueId, week }
        });

        return entities.map(fromStandingEntity);
    },
    
    findByLeagueIdAndClubId: async (leagueId, clubId) => {
        const entity = await repository.findOne({
            where: { leagueId, clubId }
        });

        return entity ? fromStandingEntity(entity) : null;
    }
});

export const defaultStandingStorePort: StandingStorePort = createStandingStoreFromRepository(standingRepository);