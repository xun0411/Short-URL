/**
 * 使用者更新個人資料
 * 給使用者用的 (使用者編輯個人資料介面)
 * 用 sessionId 獲取資料
 */
export const path = '/api/service/user/userUpdate';
export const method = 'POST';
export const loginRequired = true;
export const allowPermissions = [];


import cookie from "cookie";
import { rangeCheck } from "../../../../util/rangeCheck.js";
import { LoadType } from '../../../../@types/Express.types.js';

import type { Request, Response } from 'express';
import type { Database } from '../../../../lib/database/Maria.js';
import type { SessionManager } from '../../../../lib/SessionManager/SessionManager.js';
import type { ApiConfig } from '../../../../@types/Config.types.js';
import type { ResultData } from "../../../../@types/Express.types.js";

export async function execute(req: Request, res: Response, config: ApiConfig, db: Database, sessionManager: SessionManager): Promise<ResultData> {
    let result: object[] =[] ;

    // 參數檢查
    if (
        (typeof (req.body.name) !== 'string' || !rangeCheck.string_length(req.body.name, 100)) ||
        (typeof (req.body.email) !== 'string' || !rangeCheck.string_length(req.body.email, 100))
    ) {
        return {
            loadType: LoadType.PARAMETER_ERROR,
            data: []
        };
    }

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

    try {
        const query = `
            UPDATE user
            SET 
                name = "${req.body.name}",
                email = "${req.body.email}"
            WHERE 
                username = "${sessionData.username}";
        `;

        result = await db.query(query);
        console.log('result', result);
    } catch (error) {
        console.log(path, error);
        return {
            loadType: LoadType.QUERY_FAILED,
            data: []
        };
    }


    return {
        loadType: LoadType.SUCCEED,
        data: []
    };
}