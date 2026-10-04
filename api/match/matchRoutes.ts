import express, {Request, Response} from 'express';
import { authValidator } from '../authValidator';
import { MatchReportByIdRequest, MatchReportResponse, MatchEventPayload, MatchNaturePayload } from './MatchRequestAndResponseTypes';
import { getMatchReport } from '../../controllers/getMatchReport';
import { ApiResponse, sendSuccessResponse, sendErrorResponse } from '../ApiResponse';


const baseUrl = '/api/match';
const matchRouter = express.Router();

matchRouter.get(`${baseUrl}/:id`,
        authValidator,
        async (req: Request<MatchReportByIdRequest, any, any>, res: Response<ApiResponse<MatchReportResponse>>) => {

    const id = Number.parseInt(req.params.id);

    try {
        const matchReport = await getMatchReport(id);

        const responsePayload: MatchReportResponse = {
            matchId: matchReport.matchId,
            homeTeam: matchReport.homeTeam,
            homeTeamId: matchReport.homeTeamId,
            awayTeam: matchReport.awayTeam,
            awayTeamId: matchReport.awayTeamId,
            phases: mapMatchNaturesToPayload(matchReport.phases),
            events: mapMatchEventsToPayload(matchReport.events),
        }

        res.json(sendSuccessResponse(responsePayload));
    } catch (error) {
        res.json(sendErrorResponse(['INTERNAL_SERVER_ERROR']));
    }
});

const mapMatchNaturesToPayload = (matchNatures: any[]): MatchNaturePayload[] => {
    return [];
};

const mapMatchEventsToPayload = (matchEvents: any[]): MatchEventPayload[] => {
    return [];
};

export default matchRouter;