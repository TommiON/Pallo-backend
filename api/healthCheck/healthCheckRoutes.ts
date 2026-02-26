import express, {Express, Request, Response} from 'express';

import { ApiResponse, sendSuccessResponse } from '../ApiResponse';
import { HealthCheckResponse } from "./HealthCheckResponse";

const baseUrl = '/api/healthcheck';
const healthCheckRouter = express.Router();

healthCheckRouter.get(`${baseUrl}/`, (req: Request, res: Response<ApiResponse<HealthCheckResponse>>) => {
    const response: HealthCheckResponse = {
        health: 'Feeling good, boss!',
    };

    res.json(
        sendSuccessResponse(response)
    );
})

export default healthCheckRouter;
