import express, {Request, Response} from 'express';

import { ApiResponse, sendSuccessResponse, sendErrorResponse } from '../ApiResponse';
import { PlayerResponse } from './PlayerResponse';
import { findPlayersByIds, PlayerResult } from '../../services/playerService';

const baseUrl = '/api/player';
const playerRouter = express.Router();

playerRouter.get(`${baseUrl}/`, async (req: Request, res: Response<ApiResponse<PlayerResponse>>) => {
    const ids = req.body.ids;
    const result: PlayerResult = await findPlayersByIds(ids);
    // miten kannattaa tyypittää OwnPlayer vs OthersPlayer?
    res.json(sendSuccessResponse(result.ownPlayers));
});

export default playerRouter;