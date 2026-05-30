import { EntityManager, Repository } from "typeorm";

import appDataSource from "../../config/datasource";
import Club from "../../domainCore/club/Club";
import Player from "../../domainCore/player/Player";
import { eventNotifications } from "../../dataAccess/eventNotifications";
import {
    ClubEventsPort,
    ClubStorePort,
    ClubTransactionalStorePort,
    ClubTransactionPort
} from "../../dataAccess/ports/clubPorts";
import { ClubEntity, ClubEntityData } from "../entities/ClubEntity";
import { PlayerEntity, PlayerEntityData } from "../entities/PlayerEntity";
import { fromClubEntity, toClubEntityData } from "../mappers/clubMapper";
import { toPlayerEntityData } from "../mappers/playerMapper";
import { clubRepository } from "../repositories/repositories";

const findNonAttachedUserClubIdsWithRepository = async (
    repository: Repository<ClubEntityData>,
    currentSeason: number
): Promise<number[]> => {
    const rawClubIds = await repository
        .createQueryBuilder("club")
        .select("club.id", "id")
        .where("club.zombie = :zombie", { zombie: false })
        .andWhere((qb) => {
            const subQuery = qb
                .subQuery()
                .select("1")
                .from("league_clubs", "lc")
                .innerJoin("league", "league", "league.id = lc.league_id")
                .where("lc.club_id = club.id")
                .andWhere("league.season = :currentSeason")
                .getQuery();

            return `NOT EXISTS ${subQuery}`;
        })
        .setParameter("currentSeason", currentSeason)
        .getRawMany<{ id: number }>();

    return rawClubIds.map((club) => Number(club.id));
};

const findAttachedUserClubIdsWithRepository = async (
    repository: Repository<ClubEntityData>,
    currentSeason: number
): Promise<number[]> => {
    const rawClubIds = await repository
        .createQueryBuilder("club")
        .select("club.id", "id")
        .where("club.zombie = :zombie", { zombie: false })
        .andWhere((qb) => {
            const subQuery = qb
                .subQuery()
                .select("1")
                .from("league_clubs", "lc")
                .innerJoin("league", "league", "league.id = lc.league_id")
                .where("lc.club_id = club.id")
                .andWhere("league.season = :currentSeason")
                .getQuery();

            return `EXISTS ${subQuery}`;
        })
        .setParameter("currentSeason", currentSeason)
        .getRawMany<{ id: number }>();

    return rawClubIds.map((club) => Number(club.id));
};

const findZombieClubIdsWithRepository = async (repository: Repository<ClubEntityData>): Promise<number[]> => {
    const rawClubIds = await repository
        .createQueryBuilder("club")
        .select("club.id", "id")
        .where("club.zombie = :zombie", { zombie: true })
        .getRawMany<{ id: number }>();

    return rawClubIds.map((club) => Number(club.id));
};

const createClubStoreFromRepository = (repository: Repository<ClubEntityData>): ClubStorePort => ({
    save: async (club: Club): Promise<Club> => {
        const savedEntity = await repository.save(toClubEntityData(club) as any);
        return fromClubEntity(savedEntity);
    },

    findByIdWithPlayers: async (id: number): Promise<Club | null> => {
        const entity = await repository.findOne({
            where: { id },
            relations: ["players"]
        });

        return entity ? fromClubEntity(entity) : null;
    },

    existsForName: async (name: string): Promise<boolean> => {
        const club = await repository.findOneBy({ name });
        return !!club;
    },

    findNonAttachedUserClubIds: async (currentSeason: number): Promise<number[]> => {
        return findNonAttachedUserClubIdsWithRepository(repository, currentSeason);
    },

    findAttachedUserClubIds: async (currentSeason: number): Promise<number[]> => {
        return findAttachedUserClubIdsWithRepository(repository, currentSeason);
    },

    findZombieClubIds: async (): Promise<number[]> => {
        return findZombieClubIdsWithRepository(repository);
    }
});

const createTransactionalClubStore = (
    clubRepo: Repository<ClubEntityData>,
    playerRepo: Repository<PlayerEntityData>,
    manager: EntityManager
): ClubTransactionalStorePort => ({
    ...createClubStoreFromRepository(clubRepo),

    savePlayers: async (players: Player[]): Promise<void> => {
        const playerEntities = players.map((player) => toPlayerEntityData(player));
        await playerRepo.save(playerEntities as any);
    },

    removeZombieClubsGraph: async (zombieClubIds: number[]): Promise<void> => {
        if (zombieClubIds.length === 0) {
            return;
        }

        await manager
            .createQueryBuilder()
            .delete()
            .from("match_event")
            .where(
                "match_id IN (SELECT id FROM match WHERE home_club_id IN (:...zombieClubIds) OR away_club_id IN (:...zombieClubIds))"
            )
            .setParameter("zombieClubIds", zombieClubIds)
            .execute();

        await manager
            .createQueryBuilder()
            .delete()
            .from("match")
            .where("home_club_id IN (:...zombieClubIds)")
            .orWhere("away_club_id IN (:...zombieClubIds)")
            .setParameter("zombieClubIds", zombieClubIds)
            .execute();

        await manager
            .createQueryBuilder()
            .delete()
            .from("player")
            .where("club_id IN (:...zombieClubIds)")
            .setParameter("zombieClubIds", zombieClubIds)
            .execute();

        await manager
            .createQueryBuilder()
            .delete()
            .from("league_clubs")
            .where("club_id IN (:...zombieClubIds)")
            .setParameter("zombieClubIds", zombieClubIds)
            .execute();

        await manager
            .createQueryBuilder()
            .delete()
            .from("club")
            .where("id IN (:...zombieClubIds)")
            .setParameter("zombieClubIds", zombieClubIds)
            .execute();
    }
});

export const defaultClubStorePort: ClubStorePort = createClubStoreFromRepository(clubRepository);

export const defaultClubTransactionPort: ClubTransactionPort = {
    runInTransaction: async <T>(operation: (store: ClubTransactionalStorePort) => Promise<T>): Promise<T> => {
        return appDataSource.transaction(async (manager: EntityManager) => {
            const transactionalClubRepository = manager.getRepository<ClubEntityData>(ClubEntity);
            const transactionalPlayerRepository = manager.getRepository<PlayerEntityData>(PlayerEntity);
            const transactionalStore = createTransactionalClubStore(
                transactionalClubRepository,
                transactionalPlayerRepository,
                manager
            );
            return operation(transactionalStore);
        });
    }
};

export const defaultClubEventsPort: ClubEventsPort = {
    emitClubCreated: (club: Club): void => {
        eventNotifications.emit("club.created", club);
    }
};
