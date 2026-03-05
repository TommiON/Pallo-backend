import express from "express";
import cors from "cors";

import environment from "./config/environment";
import appDataSource from "./config/datasource";
import healthCheckRouter from "./api/healthCheck/healthCheckRoutes";
import playerRouter from "./api/player/playerRoutes";
import clubRouter from "./api/club/clubRoutes";
import loginRouter from "./api/login/loginRoutes";

import { initializeDomain } from "./domainEngine/initializer";

const app = express();

app.use(express.json());
app.use(cors());

app.use(healthCheckRouter);
app.use(loginRouter);
app.use(playerRouter);
app.use(clubRouter);

const start = async () => {
    try {
        await appDataSource.initialize();
        await initializeDomain();

        app.listen(environment.port);
        
        console.log(`Sovellus käynnissä, kuuntelee porttia ${environment.port}.`);
    } catch (error) {
        console.error('Virhe sovelluksen käynnistyksessä:', error)
    }
}

start();