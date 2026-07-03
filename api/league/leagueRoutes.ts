import express, {Request, Response} from 'express';

import { ApiResponse, sendSuccessResponse, sendErrorResponse } from '../ApiResponse';
import { LeagueByQueryRequest, LeaguesByQueryResponse, LeaguePayload } from './LeagueRequestAndResponseTypes';
import { getLeaguesBySeasonRequestValidator } from './leagueRequestValidator';
import { authValidator } from '../authValidator';
import League from '../../domainCore/League';
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
                const response: LeaguePayload[] = leagues.map(mapLeagueToPayload);
                res.json(sendSuccessResponse(response));
            } catch (error) {
                res.json(sendErrorResponse(['INTERNAL_SERVER_ERROR']));
            }
        } else {
            try {
                const league = await findLeagueBySeasonAndDivionalPosition(season, divisionLevel!, serialNumberOnDivisionLevel!);
                const response: LeaguePayload[] = league ? [mapLeagueToPayload(league)] : [];
                res.json(sendSuccessResponse(response));
            } catch (error) {
                res.json(sendErrorResponse(['INTERNAL_SERVER_ERROR']));
            }
        }
    }
);

const mapLeagueToPayload = (league: League): LeaguePayload => {
    return {
        id: league.id!,
        season: league.season,
        divisionLevel: league.divisionLevel,
        serialNumberOnDivisionLevel: league.serialNumberOnDivisionLevel,
        started: league.started,
        finished: league.finished,
        promotesToId: league.promotesTo ? league.promotesTo.id! : null,
        clubs: league.clubs ? league.clubs.map(club => ({
            id: club.id!,
            name: club.name,
            zombie: club.zombie
        })) : [],
        fixtures: league.fixtures ? league.fixtures.map(match => ({
            id: match.id!,
            week: match.week,
            started: match.started,
            finished: match.finished,
            homeClubId: match.homeClub.id!,
            homeClubName: match.homeClub.name,
            awayClubId: match.awayClub.id!,
            awayClubName: match.awayClub.name
        })) : []
    };
};

export default leagueRouter;