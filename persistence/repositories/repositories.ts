import { Repository } from "typeorm";

import appDataSource from "../../config/datasource";

import { PlayerEntity, PlayerEntityData } from "../entities/PlayerEntity";
export const playerRepository: Repository<PlayerEntityData> = appDataSource.getRepository(PlayerEntity);

import { ClubEntity, ClubEntityData } from "../entities/ClubEntity";
export const clubRepository: Repository<ClubEntityData> = appDataSource.getRepository(ClubEntity);

import { LeagueEntity, LeagueEntityData } from "../entities/LeagueEntity";
export const leagueRepository: Repository<LeagueEntityData> = appDataSource.getRepository(LeagueEntity);

import { MatchEntity, MatchEntityData } from "../entities/MatchEntity";
export const matchRepository: Repository<MatchEntityData> = appDataSource.getRepository(MatchEntity);

import { TimeEntity, TimeEntityData } from "../entities/TimeEntity";
export const timeRepository: Repository<TimeEntityData> = appDataSource.getRepository(TimeEntity);
