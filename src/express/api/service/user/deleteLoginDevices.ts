/**
 * 使用者刪除已登入的一個裝置
 * 用 sessionId 獲取資料
 */
export const path = '/api/service/user/deleteLoginDevices';
export const method = 'DELETE';
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

export async function execute(req: Request, res: Response, config: ApiConfig, db: Database, sessionManager: SessionManager): Promise<ResultData>{
    let result: object[] = [];

    // 檢查請求參數型別是否正確
    if (typeof (req.body.session_id) !== 'number' || !rangeCheck.int(req.body.session_id)) {
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
        const delId = req.body.session_id;

        const checkQuery = `
            SELECT 
                COUNT(session.id) as count
            FROM 
                session
            JOIN 
                user ON session.user_id = user.id
            WHERE 
                user.username = '${sessionData.username}' AND
                session.id = ${delId};
        `;
        result = await db.query(checkQuery);

        if (Number(((result as any))[0].count) === 0) {
            return {
                loadType: LoadType.DATA_NOT_FOUND,
                data: []
            };
        }


        const query = `DELETE FROM session WHERE id = ${delId};`;
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
        data: []
    };
}