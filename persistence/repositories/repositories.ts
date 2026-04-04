import { EntityManager, Repository } from "typeorm";

import appDataSource from "../../config/datasource";

import { PlayerEntity, PlayerEntityData } from "../entities/PlayerEntity";
export const playerRepository: Repository<PlayerEntityData> = appDataSource.getRepository(PlayerEntity);

import { ClubEntity, ClubEntityData } from "../entities/ClubEntity";
export const clubRepository: Repository<ClubEntityData> = appDataSource.getRepository(ClubEntity);

import { LeagueEntity, LeagueEntityData } from "../entities/LeagueEntity";
export const leagueRepository: Repository<LeagueEntityData> = appDataSource.getRepository(LeagueEntity);

import { MatchEntity, MatchEntityData } from "../entities/MatchEntity";
export const matchRepository: Repository<MatchEntityData> = appDataSource.getRepository(MatchEntity);

import { MatchEventEntity, MatchEventEntityData } from "../entities/MatchEventEntity";
export const matchEventRepository: Repository<MatchEventEntityData> = appDataSource.getRepository(MatchEventEntity);

import { TimeEntity, TimeEntityData } from "../entities/TimeEntity";
export const timeRepository: Repository<TimeEntityData> = appDataSource.getRepository(TimeEntity);

export const getTransactionalRepositories = (manager: EntityManager) => ({
	playerRepository: manager.getRepository<PlayerEntityData>(PlayerEntity),
	clubRepository: manager.getRepository<ClubEntityData>(ClubEntity),
	leagueRepository: manager.getRepository<LeagueEntityData>(LeagueEntity),
	matchRepository: manager.getRepository<MatchEntityData>(MatchEntity),
	matchEventRepository: manager.getRepository<MatchEventEntityData>(MatchEventEntity),
	timeRepository: manager.getRepository<TimeEntityData>(TimeEntity)
});
