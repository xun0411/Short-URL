/**
 * 獲取指定使用者短網址的所有內容
 */
export const path = '/api/urldata/getOneUser';
export const method = 'GET';
export const loginRequired = true;
export const allowPermissions = [];


import cookie from "cookie";
import { formatDate } from '../../../util/formatDate.js';
import { LoadType } from '../../../@types/Express.types.js';

import type { Request, Response } from 'express';
import type { SessionManager } from '../../../lib/SessionManager/SessionManager.js';
import type { Database } from '../../../lib/database/Maria.js';
import type { ApiConfig } from '../../../@types/Config.types.js';
import type { ResultData } from '../../../@types/Express.types.js';

export async function execute(req: Request, res: Response, config: ApiConfig, db: Database, sessionManager: SessionManager): Promise<ResultData> {
    let result: object[] = [];

    try {
        /**
         * 從 cookie.sessionId 獲取使用者ID
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
                urldata.id,
                urldata.short_url,
                urldata.long_url,
                urldata.created_at,
                urldata.expire_date,
                urldata.password
            FROM
                urldata
            LEFT JOIN
                user ON urldata.user_id = user.id
            WHERE
                user.username = "${sessionData.username}";
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
     * 從資料庫獲取到的時間格式為 YYYY-MM-DD
     * 但因為經過 mariadb 模組的 Date() 轉換 變成 nodejs 的 Date (2023-09-08T16:00:00.000Z)
     * 需使用 formatDate() 格式化成 YYYY-MM-DD
     */

    result = result.map((item: any) => {
        item.created_at = formatDate(item.created_at);
        return item;
    });


    return {
        loadType: LoadType.SUCCEED,
        data: result
    };
}