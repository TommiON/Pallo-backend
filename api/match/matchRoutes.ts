import express, {Request, Response} from 'express';
import { authValidator } from '../authValidator';
import { MatchReportByIdRequest, MatchReportResponse, MatchEventPayload, MatchNaturePayload } from './MatchRequestAndResponseTypes';
import { getMatchReport } from '../../controllers/getMatchReport';
import { ApiResponse, sendSuccessResponse, sendErrorResponse } from '../ApiResponse';
import { MatchNatureData } from '../../domainCore/MatchNature';
import { MatchEventData } from '../../domainCore/MatchEvent';


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

const mapMatchNaturesToPayload = (matchNatures: MatchNatureData[]): MatchNaturePayload[] => {
    return matchNatures.map(nature => ({
        startMinute: nature.startMinute,
        endMinute: nature.endMinute,
        homePossession: {
            homeDefenceLeft: getRequiredMapValue(nature.homePossession, 'homeDefenceLeft'),
            homeDefenceCenter: getRequiredMapValue(nature.homePossession, 'homeDefenceCentre'),
            homeDefenceRight: getRequiredMapValue(nature.homePossession, 'homeDefenceRight'),
            midfield: getRequiredMapValue(nature.homePossession, 'midfield'),
            homeAttackLeft: getRequiredMapValue(nature.homePossession, 'homeAttackLeft'),
            homeAttackCenter: getRequiredMapValue(nature.homePossession, 'homeAttackCentre'),
            homeAttackRight: getRequiredMapValue(nature.homePossession, 'homeAttackRight'),
        },
        balance: {
            homeDefenceLeft: getRequiredMapValue(nature.balance, 'homeDefenceLeft'),
            homeDefenceCenter: getRequiredMapValue(nature.balance, 'homeDefenceCentre'),
            homeDefenceRight: getRequiredMapValue(nature.balance, 'homeDefenceRight'),
            midfield: getRequiredMapValue(nature.balance, 'midfield'),
            homeAttackLeft: getRequiredMapValue(nature.balance, 'homeAttackLeft'),
            homeAttackCenter: getRequiredMapValue(nature.balance, 'homeAttackCentre'),
            homeAttackRight: getRequiredMapValue(nature.balance, 'homeAttackRight'),
        }
    }));
};

const getRequiredMapValue = (map: ReadonlyMap<string, number>, key: string): number => {
    const value = map.get(key);

    if (value === undefined) {
        throw new Error(`Missing MatchNature map value for key: ${key}`);
    }

    return value;
};

const mapMatchEventsToPayload = (matchEvents: MatchEventData[]): MatchEventPayload[] => {
    return matchEvents.map(event => ({
        eventType: event.type,
        initiator: event.initiator ? event.initiator : '',
        minute: event.minute,
    }));
};

export default matchRouter;