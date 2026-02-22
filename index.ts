import express from "express";
import cors from "cors";

import environment from "./config/environment";

const app = express();


app.use(express.json());
app.use(cors());

const start = async () => {
    app.listen(environment.port, () => {
        console.log(`Server running on port ${environment.port}`);
    });
};

start();