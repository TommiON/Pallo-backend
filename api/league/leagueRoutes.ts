import express, {Request, Response} from 'express';

import { ApiResponse, sendSuccessResponse, sendErrorResponse } from '../ApiResponse';
import { LeagueBySeasonRequest, LeaguesBySeasonResponse } from './LeagueRequestResponseTypes';
import { getLeaguesBySeasonRequestValidator } from './leagueRequestValidator';
import { authValidator } from '../authValidator';
import { findLeaguesBySeason } from '../../dataAccess/leagueService';

const baseUrl = '/api/league';
const leagueRouter = express.Router();

// GET leagues by season
leagueRouter.get(`${baseUrl}/`,
    authValidator,
    getLeaguesBySeasonRequestValidator,
    async (req: Request<any, any, LeagueBySeasonRequest>, res: Response<ApiResponse<LeaguesBySeasonResponse>>) => {
        const season = req.body.season;
        try {
            const leagues = await findLeaguesBySeason(season);
            res.json(sendSuccessResponse(leagues));
        } catch (error) {
            res.json(sendErrorResponse(['INTERNAL_SERVER_ERROR']));
        }
    }
);

export default leagueRouter;