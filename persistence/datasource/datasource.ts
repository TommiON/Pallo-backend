import { DataSource } from "typeorm";

import environment from "../../config/environment";
import { PlayerEntity } from "../entities/PlayerEntity";
import { ClubEntity } from "../entities/ClubEntity";
import { LeagueEntity } from "../entities/LeagueEntity";
import { MatchEntity } from "../entities/MatchEntity";
import { MatchEventEntity } from "../entities/MatchEventEntity";
import { TimeEntity } from "../entities/TimeEntity";
import { StandingEntity } from "../entities/StandingEntity";
import { MatchNatureEntity } from "../entities/MatchNatureEntity";

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
        LeagueEntity,
        MatchEntity,
        MatchEventEntity,
        TimeEntity,
        StandingEntity,
        MatchNatureEntity
    ],
    subscribers:    [],
    migrations:     []
});

export default appDataSource;