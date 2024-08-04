/**
 * 獲取 短網址 所有內容
 */
export const path = '/api/urldata/getAll';
export const method = 'GET';
export const loginRequired = false;
export const allowPermissions = [];


import { formatDate } from '../../../util/formatDate.js';
import { LoadType } from '../../../@types/Express.types.js';

import type { Request, Response } from 'express';
import type { Database } from '../../../lib/database/Maria.js';
import type { ApiConfig } from '../../../@types/Config.types.js';
import type { ResultData } from '../../../@types/Express.types.js';

export async function execute(req: Request, res: Response, config: ApiConfig, db: Database): Promise<ResultData> {
    let result: object[] = [];

    try{

        /**
         * 檢查此資料表是否為空
         */
        const countQuery = `SELECT COUNT(*) FROM UrlData;`;
        result = await db.query(countQuery);
        const count = Number((result[0] as any)['COUNT(*)']);

        if (count <= 0) {
            return {
                loadType: LoadType.DATA_NOT_FOUND,
                data: []
            };
        }


        const query = `
            SELECT
                urldata.id,
                JSON_OBJECT(
                    'id', user.id,
                    'username', user.username
                ) AS user,
                urldata.short_url,
                urldata.long_url,
                urldata.created_at,
                urldata.expire_date,
                urldata.password
            FROM
                urldata
            LEFT JOIN
                user ON urldata.user_id = user.id;
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