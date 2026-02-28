import express, {Request, Response} from 'express';

import { ApiResponse, sendSuccessResponse, sendErrorResponse } from '../ApiResponse';
import { PlayersByIdsRequest, PlayerResponse } from './PlayerRequestResponseTypes';
import { getPlayersByIdsRequestValidator } from './playerRequestValidator';
import { findPlayersByIds } from '../../services/playerService';

const baseUrl = '/api/player';
const playerRouter = express.Router();

// GET players by a list of ids
playerRouter.get(`${baseUrl}/`, 
                getPlayersByIdsRequestValidator, 
                async (req: Request<PlayersByIdsRequest>, res: Response<ApiResponse<PlayerResponse>>) => {
    const result = await findPlayersByIds(req.body.ids);

    const ownPlayers = result.ownPlayers.map(p => ({ ...p, restricted: false }));
    const othersPlayers = result.othersPlayers.map(p => ({ ...p, restricted: true }));
    
    res.json(sendSuccessResponse([...ownPlayers, ...othersPlayers]));
});

export default playerRouter;