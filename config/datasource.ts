import { DataSource } from "typeorm";

import environment from "./environment";
import { PlayerEntity } from "../persistence/entities/PlayerEntity";

const appDataSource = new DataSource({
    type:           'postgres',
    host:           environment.dbHost,
    port:           5432,
    username:       environment.dbUsername,
    password:       environment.dbPassword,
    synchronize:    true,
    logging:        false,
    entities:       [
        PlayerEntity
    ],
    subscribers:    [],
    migrations:     []
});

export default appDataSource;