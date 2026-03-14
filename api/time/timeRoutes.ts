import express, {Request, Response} from 'express';

import { ApiResponse, sendSuccessResponse, sendErrorResponse } from '../ApiResponse';
import { TimeResponse } from './TimeResponseTypes';
import { authValidator } from '../authValidator';
import { getCurrentTime, getWeeklyEvents } from '../../services/timeService';

const baseUrl = '/api/time';
const timeRouter = express.Router();

timeRouter.get(`${baseUrl}/`,
    authValidator,
    async (req: Request<{}, any, {}>, res: Response<ApiResponse<TimeResponse>>) => {
        const time = await getCurrentTime();
        const events = getWeeklyEvents();

        const response: TimeResponse = {
            currentTime: {
                season: time!.season,
                week: time!.week,
                day: time!.day,
                hour: time!.hour
            },
            upcomingEvents: events
        };

        res.json(sendSuccessResponse(response));
    });

export default timeRouter;