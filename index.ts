import express from "express";
import cors from "cors";

import environment from "./config/environment";
import appDataSource from "./config/datasource";

import healthCheckRouter from "./api/healthCheck/healthCheckRoutes";
import playerRouter from "./api/player/playerRoutes";
import clubRouter from "./api/club/clubRoutes";
import loginRouter from "./api/login/loginRoutes";
import timeRouter from "./api/time/timeRoutes";
import leagueRouter from "./api/league/leagueRoutes";

import { configureAuthService } from "./dataAccess/authService";
import { configureClubService } from "./dataAccess/clubService";
import { configureLeagueService } from "./dataAccess/leagueService";
import { configurePlayerService } from "./dataAccess/playerService";
import { configureTimeService } from "./dataAccess/timeService";
import { configureMatchService } from "./dataAccess/matchService";

import { defaultAuthStorePort } from "./persistence/adapters/authAdapters";
import { defaultClubEventsPort, defaultClubStorePort, defaultClubTransactionPort } from "./persistence/adapters/clubAdapters";
import { defaultLeagueStorePort, defaultLeagueTransactionPort } from "./persistence/adapters/leagueAdapters";
import { defaultPlayerStorePort } from "./persistence/adapters/playerAdapters";
import { defaultTimeEventsPort, defaultTimeStorePort, defaultTimeTransactionPort } from "./persistence/adapters/timeAdapters";
import { defaultMatchStorePort, defaultMatchTransactionPort } from "./persistence/adapters/matchAdapters";

import { initializeScheduler, startScheduler } from "./scheduler/scheduler";

const app = express();

app.use(express.json());
app.use(cors());

app.use(healthCheckRouter);
app.use(loginRouter);
app.use(playerRouter);
app.use(clubRouter);
app.use(timeRouter);
app.use(leagueRouter);

const start = async () => {
    try {
        await appDataSource.initialize();

        configureAuthService({ authStore: defaultAuthStorePort });
        configureClubService({ clubStore: defaultClubStorePort, clubTransaction: defaultClubTransactionPort, clubEvents: defaultClubEventsPort });
        configureLeagueService({ leagueStore: defaultLeagueStorePort, leagueTransaction: defaultLeagueTransactionPort });
        configurePlayerService({ playerStore: defaultPlayerStorePort });
        configureTimeService({ timeStore: defaultTimeStorePort, timeTransaction: defaultTimeTransactionPort, timeEvents: defaultTimeEventsPort });
        configureMatchService({ matchStore: defaultMatchStorePort, matchTransaction: defaultMatchTransactionPort });

        await initializeScheduler();
        startScheduler();
        
        app.listen(environment.port);
        
        console.log(`Sovellus käynnissä, kuuntelee porttia ${environment.port}.`);
    } catch (error) {
        console.error('Virhe sovelluksen käynnistyksessä:', error)
    }
}

start();