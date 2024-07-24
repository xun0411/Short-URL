/**
 * 使用者更新密碼
 * 給使用者用的 (使用者編輯個人資料介面)
 * 用 sessionId 獲取資料
 */
export const path = '/api/service/user/userUpdatePassword';
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

// old_password     舊密碼
// new_password     新密碼

export async function execute(req: Request, res: Response, config: ApiConfig, db: Database, sessionManager: SessionManager): Promise<ResultData> {
    let result: object[]= [];

    // 參數檢查
    if (
        (typeof (req.body.old_password) !== 'string' || !rangeCheck.string_length(req.body.old_password, 100)) ||
        (typeof (req.body.new_password) !== 'string' || !rangeCheck.string_length(req.body.new_password, 100))
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
        /**
         * 檢查舊密碼是否正確
         */
        const accountQuery = `
            SELECT COUNT(*) 
            FROM user 
            WHERE 
                username = "${sessionData.username}" AND 
                password = "${sessionManager.auth.hashPassword(req.body.old_password)}" AND 
                registered = 1;
        `;
        result = await db.query(accountQuery);
        const count = Number((result[0] as any)['COUNT(*)']);

        if (count <= 0) {
            return {
                loadType: LoadType.OLD_PASSWORD_ERROR,
                data: [
                    {
                        username: sessionData.username,
                        old_password: req.body.old_password,
                        new_password: req.body.new_password
                    }
                ]
            };
        }


        const query = `
            UPDATE user
            SET password = "${sessionManager.auth.hashPassword(req.body.new_password)}"
            WHERE username = "${sessionData.username}";
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