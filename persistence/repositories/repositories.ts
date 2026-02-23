import appDataSource from "../../config/datasource";

import { PlayerEntity } from "../entities/PlayerEntity";
export const playerRepository = appDataSource.getRepository(PlayerEntity);