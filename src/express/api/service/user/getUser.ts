/**
 * 獲取指定使用者個人資料
 * 使用者用
 * 用 sessionId 獲取資料
 */
export const path = '/api/service/user/getUser';
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
    let result: object[] = [];

    try{
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

        const query = `
            SELECT 
                username,
                name,
                email
            FROM user 
            WHERE username = "${sessionData.username}";
        `;
        result = await db.query(query);
    } catch (error) {
        console.log(path, error);
        return {
            loadType: LoadType.QUERY_FAILED,
            data: []
        };
    }

    return {
        loadType: LoadType.SUCCEED,
        data: result
    };
}