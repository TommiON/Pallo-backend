import express from "express";
import cors from "cors";

import environment from "./config/environment";
import appDataSource from "./config/datasource";
import healthCheckRouter from "./api/healthCheck/healthCheckRoutes";

const app = express();

app.use(express.json());
app.use(cors());

app.use(healthCheckRouter);

const start = async () => {
    appDataSource.initialize()
        .then(() => {
            console.log('Datalähde auki.');
            // tähän startScheduler() -tyyppinen kun ollaan siellä asti...
            app.listen(environment.port);
            console.log(`Sovellus käynnissä, kuuntelee porttia ${environment.port}.`);
        })
};

start();