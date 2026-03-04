import express, { Request, Response } from 'express';

import { ApiResponse, sendSuccessResponse, sendErrorResponse } from '../ApiResponse';
import { LoginRequest, LoginResponse } from './LoginRequestResponseTypes';
import { loginRequestValidator } from './loginRequestValidator';
import { generateToken } from '../../services/authService';

const baseUrl = '/api/login';
const loginRouter = express.Router();

// POST login
loginRouter.post(`${baseUrl}/`,
                loginRequestValidator,
                async (req: Request<any, any, LoginRequest>, res: Response<ApiResponse<LoginResponse>>) => {
                    const authenticatedUser = {
                        clubName: req.body.clubName,
                        // from loginRequestValidator further up the chain
                        clubId: res.locals.authenticatedClubId
                    };

                    const tokenForAuthenticatedUser = generateToken(authenticatedUser);

                    res.json(sendSuccessResponse({
                        token: tokenForAuthenticatedUser,
                        clubId: authenticatedUser.clubId,
                        clubName: authenticatedUser.clubName
                    }));
                }
)

export default loginRouter;