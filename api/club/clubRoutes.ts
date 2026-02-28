import express, {Request, Response} from 'express';

import { ApiResponse, sendSuccessResponse, sendErrorResponse } from '../ApiResponse';
import { CreateClubRequest, ClubByIdRequest, ClubResponse } from './ClubRequestResponseTypes';
import { createClubRequestValidator, getClubByIdRequestValidator } from './clubRequestValidator';
import { createClub, findClubById} from '../../services/clubService';

const baseUrl = '/api/club';
const clubRouter = express.Router();

// POST create a new club
clubRouter.post(`${baseUrl}/`,
            createClubRequestValidator,
            async (req: Request<any, any, CreateClubRequest>, res: Response<ApiResponse<ClubResponse>>) => {
                const newClub = await createClub(req.body.name, req.body.password);

                delete newClub.passwordHash;

                res.json(sendSuccessResponse(newClub));
            }
)

// GET club by id
clubRouter.get(`${baseUrl}/`,
            getClubByIdRequestValidator,
            async (req: Request<any, any, ClubByIdRequest>, res: Response<ApiResponse<ClubResponse>>) => {
                const result = await findClubById(req.body.id);

                if (result) {
                    delete result.passwordHash;
                    res.json(sendSuccessResponse(result));
                } else {
                    res.json(sendSuccessResponse(null));
                }
            }
)

export default clubRouter;