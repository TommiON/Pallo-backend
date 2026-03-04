import { DataSource } from "typeorm";

import environment from "./environment";
import { PlayerEntity } from "../persistence/entities/PlayerEntity";
import { ClubEntity } from "../persistence/entities/ClubEntity";
import { LeagueEntity } from "../persistence/entities/LeagueEntity";
import { TimeEntity } from "../persistence/entities/TimeEntity";

const appDataSource = new DataSource({
    type:           'postgres',
    host:           environment.dbHost,
    port:           5432,
    username:       environment.dbUsername,
    password:       environment.dbPassword,
    synchronize:    true,
    logging:        false,
    entities:       [
        PlayerEntity,
        ClubEntity,
        LeagueEntity
        TimeEntity
    ],
    subscribers:    [],
    migrations:     []
});

export default appDataSource;