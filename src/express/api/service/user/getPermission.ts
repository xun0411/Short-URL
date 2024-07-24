/**
 * 獲取指定使用者權限
 * 前端用來檢查是否有指定 api 訪問權限
 * 用 sessionId 獲取資料
 */
export const path = '/api/service/user/getPermission';
export const method = 'GET';
export const loginRequired = true;
export const allowPermissions = [];


import cookie from "cookie";
import { LoadType } from '../../../../@types/Express.types.js';

import type { Request, Response } from 'express';
import type { Database } from '../../../../lib/database/Maria.js';
import type { SessionManager } from '../../../../lib/SessionManager/SessionManager.js';
import type { ApiConfig } from '../../../../@types/Config.types.js';
import type { ResultData } from "../../../../@types/Express.types.js";

export async function execute(req: Request, res: Response, config: ApiConfig, db: Database, sessionManager: SessionManager): Promise<ResultData> {
    /**
    * 從 cookie.sessionId 獲取使用者名稱
    */
    const cookies = cookie.parse(req.headers.cookie as string || '');
    const cookieSessionId = cookies.sessionId;
    const sessionData = await sessionManager.getSession(cookieSessionId);

    if (!sessionData) {
        return {
            loadType: LoadType.UNAUTHORIZED,
            data: []
        };
    }
    
    return {
        loadType: LoadType.SUCCEED,
        data: [
            {
                user_permissions: sessionData.user_permissions
            }
        ]
    };
}