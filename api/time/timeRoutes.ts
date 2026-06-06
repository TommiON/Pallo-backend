import express, {Request, Response} from 'express';

import { ApiResponse, sendSuccessResponse, sendErrorResponse } from '../ApiResponse';
import { TimeResponse } from './TimeResponseTypes';
import { authValidator } from '../authValidator';
import { getCurrentTimeWithEvents } from '../../scheduler/scheduler';

const baseUrl = '/api/time';
const timeRouter = express.Router();

timeRouter.get(`${baseUrl}/`,
    authValidator,
    async (req: Request<{}, any, {}>, res: Response<ApiResponse<TimeResponse>>) => {
        const appClock = await getCurrentTimeWithEvents();

        const response: TimeResponse = {
            currentTime: {
                season: appClock.season,
                week: appClock.week,
                day: appClock.day,
                hour: appClock.hour
            },
            upcomingEvents: appClock.weeklyEvents
        };

        res.json(sendSuccessResponse(response));
    });

export default timeRouter;