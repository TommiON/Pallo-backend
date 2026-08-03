import express, {Request, Response} from 'express';

import { ApiResponse, sendSuccessResponse } from '../ApiResponse';
import { PlayersByIdsRequest, PlayerResponse } from './PlayerRequestResponseTypes';
import { getPlayersByIdsRequestValidator } from './playerRequestValidator';
import { authValidator } from '../authValidator';
import { findPlayersByIds } from '../../dataAccess/playerService';
import Player from '../../domainCore/Player';

const baseUrl = '/api/player';
const playerRouter = express.Router();

const mapPlayerWithRestricted = (p: Player, restricted: boolean) => ({
    id: p.id,
    name: p.name,
    age: p.age,
    footedness: p.footedness,
    clubId: p.club?.id,
    stamina: p.stamina,
    pace: p.pace,
    strength: p.strength,
    height: p.height,
    positioning: p.positioning,
    vision: p.vision,
    shooting: p.shooting,
    heading: p.heading,
    passing: p.passing,
    tackling: p.tackling,
    ballControl: p.ballControl,
    dribbling: p.dribbling,
    shotStopping: p.shotStopping,
    restricted
});

// GET players by a list of ids
playerRouter.get(`${baseUrl}/`,
    authValidator,
    getPlayersByIdsRequestValidator, 
    async (req: Request<PlayersByIdsRequest>, res: Response<ApiResponse<PlayerResponse>>) => {

        const result = await findPlayersByIds(req.body.ids, res.locals.authenticatedUser);

        const ownPlayers = result.ownPlayers.map(p => mapPlayerWithRestricted(p, false));
        const othersPlayers = result.othersPlayers.map(p => mapPlayerWithRestricted(p, true));
    
        res.json(sendSuccessResponse([...ownPlayers, ...othersPlayers]));
    }
);

export default playerRouter;