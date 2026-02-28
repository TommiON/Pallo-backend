import appDataSource from "../../config/datasource";

import { PlayerEntity } from "../entities/PlayerEntity";
export const playerRepository = appDataSource.getRepository(PlayerEntity);

import { ClubEntity } from "../entities/ClubEntity";
export const clubRepository = appDataSource.getRepository(ClubEntity);