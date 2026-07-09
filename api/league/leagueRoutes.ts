import express, {Request, Response} from 'express';

import { ApiResponse, sendSuccessResponse, sendErrorResponse } from '../ApiResponse';
import { LeagueByQueryRequest, LeaguesByQueryResponse, LeaguePayload } from './LeagueRequestAndResponseTypes';
import { getLeaguesBySeasonRequestValidator } from './leagueRequestValidator';
import { authValidator } from '../authValidator';
import League from '../../domainCore/League';
import { findLeaguesBySeason, findLeagueBySeasonAndDivionalPosition } from '../../dataAccess/leagueService';
import { createClubStandingComparator } from '../../domainEngine/leagues/standingsManager';

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
        clubs: mapClubs(league.clubs),
        fixtures: mapFixtures(league.fixtures),
        standings: mapStandings(league.standings)
    };
};

const mapClubs = (clubs: League['clubs']): LeaguePayload['clubs'] => {
    if (!clubs) {
        return [];
    }

    return clubs.map(club => ({
        id: club.id!,
        name: club.name,
        zombie: club.zombie
    }));
};

const mapFixtures = (fixtures: League['fixtures']): LeaguePayload['fixtures'] => {
    if (!fixtures) {
        return {
            played: [],
            ongoing: [],
            unplayed: []
        };
    }
    
    const allFixtures = fixtures.map(match => ({
        id: match.id!,
        week: match.week,
        started: match.started,
        finished: match.finished,
        homeClubId: match.homeClub.id!,
        homeClubName: match.homeClub.name,
        awayClubId: match.awayClub.id!,
        awayClubName: match.awayClub.name
    }));
    
    return {
        played: allFixtures.filter(fixture => fixture.started && fixture.finished).sort((a, b) => b.week - a.week),
        ongoing: allFixtures.filter(fixture => fixture.started && !fixture.finished),
        unplayed: allFixtures.filter(fixture => !fixture.started).sort((a, b) => a.week - b.week)
    };
};

const mapStandings = (standings: League['standings']): LeaguePayload['standings'] => {
    if (!standings) {
        return [];
    }

    const playedWeeks = [...new Set(standings.map(standing => standing.week))].sort((a, b) => b - a);
    return playedWeeks.map(week => {
        const weekStandings = standings.filter(standing => standing.week === week);
        const sortedWeekStandings = [...weekStandings].sort(createClubStandingComparator(weekStandings));

        return {
            week,
            standings: sortedWeekStandings.map(standing => ({
                clubId: standing.club.id!,
                clubName: standing.club.name,
                week: standing.week,
                points: standing.points,
                won: standing.wins,
                drawn: standing.draws,
                lost: standing.losses,
                goalsFor: standing.goalsFor,
                goalsAgainst: standing.goalsAgainst,
            }))
        };
    });
};


export default leagueRouter;