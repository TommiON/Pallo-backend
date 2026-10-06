import express, {Request, Response} from 'express';
import { authValidator } from '../authValidator';
import { getMatchReportByIdValidator } from './matchRequestValidator';
import { MatchReportByIdRequest, MatchReportPayload, MatchEventPayload, MatchNaturePayload, MatchReportResponse } from './MatchRequestAndResponseTypes';
import { getMatchReport } from '../../controllers/getMatchReport';
import { ApiResponse, sendSuccessResponse, sendErrorResponse } from '../ApiResponse';
import { MatchNatureData } from '../../domainCore/MatchNature';
import { MatchEventData } from '../../domainCore/MatchEvent';

const baseUrl = '/api/match';
const matchRouter = express.Router();

matchRouter.get(`${baseUrl}/:id`,
        authValidator,
        getMatchReportByIdValidator,
        async (req: Request<MatchReportByIdRequest, any, any>, res: Response<ApiResponse<MatchReportResponse>>) => {

    const id = Number.parseInt(req.params.id);

    try {
        const matchReport = await getMatchReport(id);

        if (!matchReport) {
            res.json(sendSuccessResponse(null));
            return;
        }

        const responsePayload: MatchReportPayload = {
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
            homeDefenceLeft: roundToTwoDecimals(getRequiredMapValue(nature.homePossession, 'homeDefenceLeft')),
            homeDefenceCenter: roundToTwoDecimals(getRequiredMapValue(nature.homePossession, 'homeDefenceCentre')),
            homeDefenceRight: roundToTwoDecimals(getRequiredMapValue(nature.homePossession, 'homeDefenceRight')),
            midfield: roundToTwoDecimals(getRequiredMapValue(nature.homePossession, 'midfield')),
            homeAttackLeft: roundToTwoDecimals(getRequiredMapValue(nature.homePossession, 'homeAttackLeft')),
            homeAttackCenter: roundToTwoDecimals(getRequiredMapValue(nature.homePossession, 'homeAttackCentre')),
            homeAttackRight: roundToTwoDecimals(getRequiredMapValue(nature.homePossession, 'homeAttackRight')),
        },
        balance: {
            homeDefenceLeft: roundToTwoDecimals(getRequiredMapValue(nature.balance, 'homeDefenceLeft')),
            homeDefenceCenter: roundToTwoDecimals(getRequiredMapValue(nature.balance, 'homeDefenceCentre')),
            homeDefenceRight: roundToTwoDecimals(getRequiredMapValue(nature.balance, 'homeDefenceRight')),
            midfield: roundToTwoDecimals(getRequiredMapValue(nature.balance, 'midfield')),
            homeAttackLeft: roundToTwoDecimals(getRequiredMapValue(nature.balance, 'homeAttackLeft')),
            homeAttackCenter: roundToTwoDecimals(getRequiredMapValue(nature.balance, 'homeAttackCentre')),
            homeAttackRight: roundToTwoDecimals(getRequiredMapValue(nature.balance, 'homeAttackRight')),
        }
    }));
};

const mapMatchEventsToPayload = (matchEvents: MatchEventData[]): MatchEventPayload[] => {
    return matchEvents.map(event => ({
        eventType: event.type,
        initiator: event.initiator ? event.initiator : '',
        minute: event.minute,
    }));
};

const getRequiredMapValue = (map: ReadonlyMap<string, number>, key: string): number => {
    const value = map.get(key);

    if (value === undefined) {
        throw new Error(`Missing MatchNature map value for key: ${key}`);
    }

    return value;
};

const roundToTwoDecimals = (value: number): number => {
    return parseFloat(value.toFixed(2));
};

export default matchRouter;