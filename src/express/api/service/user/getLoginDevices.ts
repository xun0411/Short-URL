/**
 * 獲取指定使用者已登入的所有裝置
 * 用 sessionId 獲取資料
 */
export const path = '/api/service/user/getLoginDevices';
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

    // 從資料庫獲取資料
    try {
        const query = `
            SELECT 
                session.id,
                session.device,
                session.last_refresh
            FROM 
                session
            JOIN 
                user ON session.user_id = user.id
            WHERE 
                user.username = '${sessionData.username}';
        `;
        result = await db.query(query);
    } catch (error) {
        console.log(path, error);
        return {
            loadType: LoadType.QUERY_FAILED,
            data: []
        };
    }


    /**
     * 資料庫 TIMESTAMP 獲取的時區為 UTC (+0:00) (2024-06-23T05:05:05.000Z)
     * 需轉換成 UTC+8 (2024-06-23 13:05:05)
     * 不在 DB 端處理時區轉換, server 端處理就好
     */
    result = result.map((item: any) => {
        item.last_refresh = new Date(item.last_refresh as string).toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
        return item;
    });


    return {
        loadType: LoadType.SUCCEED,
        data: result
    };
}