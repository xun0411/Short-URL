/**
 * 登出 API
 */
export const path = '/api/service/logout';
export const method = 'POST';
export const loginRequired = true;
export const allowPermissions = [];


import cookie from "cookie";
import { LoadType } from '../../../@types/Express.types.js';

import type { Request, Response } from 'express';
import type { Database } from '../../../lib/database/Maria.js';
import type { SessionManager } from '../../../lib/SessionManager/SessionManager.js';
import type { ApiConfig } from '../../../@types/Config.types.js';
import type { ResultData } from "../../../@types/Express.types.js";


export async function execute(req: Request, res: Response, config: ApiConfig, db: Database, sessionManager: SessionManager): Promise<ResultData> {
    const cookies = cookie.parse(req.headers.cookie as string || '');
    const cookieSessionId = cookies.sessionId;

    sessionManager.destroySession(cookieSessionId);

    res.clearCookie('sessionId');
    return {
        loadType: LoadType.SUCCEED,
        data: []
    };
}