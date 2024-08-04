/**
 * 獲取指定 有密碼短網址 的原始網址
 */
export const path = '/api/urldata/getPasswordUrl';
export const method = 'GET';
export const loginRequired = false;
export const allowPermissions = [];

import { rangeCheck } from "../../../util/rangeCheck.js";
import { formatDate } from '../../../util/formatDate.js';
import { LoadType } from '../../../@types/Express.types.js';

import type { Request, Response } from 'express';
import type { Database } from '../../../lib/database/Maria.js';
import type { ApiConfig } from '../../../@types/Config.types.js';
import type { ResultData } from '../../../@types/Express.types.js';
import type { SessionManager } from '../../../lib/SessionManager/SessionManager.js';

export async function execute(req: Request, res: Response, config: ApiConfig, db: Database, sessionManager: SessionManager): Promise<ResultData> {
    let result: object[] = [];


    // 參數檢查
    if (
        (typeof (req.query.short_url) !== 'string' || !rangeCheck.string_length(req.query.short_url, 10)) ||
        (typeof (req.query.password) !== 'string' || !rangeCheck.string_length(req.query.password, 128))   
    ) {
        return {
            loadType: LoadType.PARAMETER_ERROR,
            data: []
        };
    }

    const newUrlData = {
        short_url: req.query.short_url,
        password: sessionManager.auth.hashPassword(req.query.password)
    };


    try {
        /**
         * 檢查此網址和密碼是否正確
         */
        const countQuery = `SELECT COUNT(*) FROM UrlData WHERE short_url = "${req.query.short_url}" AND password= "${newUrlData.password}";`;
        result = await db.query(countQuery);
        const count = Number((result[0] as any)['COUNT(*)']);

        if (count <= 0) {
            return {
                loadType: LoadType.FAILED_LOGIN,
                data: []
            };
        }


        const query = `
            SELECT
                urldata.id,
                urldata.user_id,
                urldata.short_url,
                urldata.long_url,
                urldata.created_at,
                urldata.expire_date,
                urldata.password
            FROM
                urldata
            WHERE
                urldata.short_url = "${req.query.short_url}";
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