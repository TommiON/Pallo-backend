import express, {Request, Response} from 'express';

import { ApiResponse, sendSuccessResponse, sendErrorResponse } from '../ApiResponse';
import { LeagueByQueryRequest, LeaguesByQueryResponse } from './LeagueRequestAndResponseTypes';
import { getLeaguesBySeasonRequestValidator } from './leagueRequestValidator';
import { authValidator } from '../authValidator';
import { findLeaguesBySeason, findLeagueBySeasonAndDivionalPosition } from '../../dataAccess/leagueService';

const baseUrl = '/api/league';
const leagueRouter = express.Router();

// find leagues by season, and optionally by division level and serial number on that division level
leagueRouter.post(`${baseUrl}/query`,
    authValidator,
    getLeaguesBySeasonRequestValidator,
    async (req: Request<any, any, LeagueByQueryRequest>, res: Response<ApiResponse<LeaguesByQueryResponse>>) => {
        const season = req.body.season;
        const divisionLevel = req.body.divisionLevel;
        const serialNumberOnDivisionLevel = req.body.serialNumberOnDivisionLevel;

        if (divisionLevel == null && serialNumberOnDivisionLevel == null) {
            try {
                const leagues = await findLeaguesBySeason(season);
                res.json(sendSuccessResponse(leagues));
            } catch (error) {
                res.json(sendErrorResponse(['INTERNAL_SERVER_ERROR']));
            }
        } else {
            try {
                const league = await findLeagueBySeasonAndDivionalPosition(season, divisionLevel!, serialNumberOnDivisionLevel!);
                res.json(sendSuccessResponse(league ? [league] : []));
            } catch (error) {
                res.json(sendErrorResponse(['INTERNAL_SERVER_ERROR']));
            }
        }
    });

export default leagueRouter;