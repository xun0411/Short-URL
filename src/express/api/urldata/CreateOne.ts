/**
 * 建立一個新短網址
 */
export const path = '/api/urldata/CreateOne';
export const method = 'POST';
export const loginRequired = false;
export const allowPermissions = [];

import { rangeCheck } from '../../../util/rangeCheck.js';
import { emptyDataConvert, emptyDataDateConvert } from '../../../util/validDataConverter.js';
import { LoadType, MissingFK } from '../../../@types/Express.types.js';

import type { Request, Response } from 'express';
import type { Database } from '../../../lib/database/Maria.js';
import type { ApiConfig } from '../../../@types/Config.types.js';
import type { ResultData } from '../../../@types/Express.types.js';


interface UrlData {
    id?: number;
    user_id: number;                    //引用使用者的id    (INT)

    short_url: string;                        //短網址            string(10)
    long_url: string;                   //原始網址          string(1000)
    //created_at: string;                 //添加時間          Date
    expire_date: number;                //過期時間(分)      (INT_UNSIGNED)
    require_password: number;           //是否需要密碼      (Y/N) [0, 1]
    password: string | null;            //密碼              string(128)
}
/**
 * 確認的部分只有(Y/N) 不能為空
 * 所以不做 'EMPTY_DATA' 檢查
 */


export async function execute(req: Request, res: Response, config: ApiConfig, db: Database): Promise<ResultData> {
    let result: object[] = [];

    // 檢查請求參數型別是否正確
    if (
        (typeof (req.body.user_id) != 'number' || !rangeCheck.int(req.body.user_id)) ||

        (typeof (req.body.short_url) != 'string' || !rangeCheck.string_length(req.body.short_url, 10)) ||
        (typeof (req.body.long_url) != 'string' || !rangeCheck.string_length(req.body.long_url, 1000)) ||
        (typeof (req.body.expire_date) != 'number' || !rangeCheck.int_unsigned(req.body.expire_date)) ||
        (typeof (req.body.require_password) != 'number' || ![0, 1].includes(req.body.require_password)) ||
        (req.body.password !== 'EMPTY_DATA' && (typeof (req.body.password) != 'string' || !rangeCheck.string_length(req.body.password, 128)))
    ) {
        return {
            loadType: LoadType.PARAMETER_ERROR,
            data: []
        };
    }

    const newUrlData = {
        user_id: req.body.user_id,

        short_url: req.body.short_url,
        long_url: req.body.long_url,
        expire_date: req.body.expire_date,
        require_password: req.body.require_password,
        password: req.body.require_password === 1 ? emptyDataConvert(req.body.password) : 'NULL'
    };

    try {
        // 聯合查詢 檢查要引用的所有外鍵都存在
        const combinedQuery = `
            SELECT
                CASE
                    WHEN EXISTS (SELECT id FROM User WHERE id = ${newUrlData.user_id}) THEN ${newUrlData.user_id}
                END AS 'user_id'
        ;`;
        console.log('combinedQuery', combinedQuery);
        result = await db.query(combinedQuery);
        console.log('result', result);

        // 檢查每個 Table 回傳結果
        const userResult = result.find((row: any) => row.user_id === newUrlData.user_id);

        if (!userResult) {
            return {
                loadType: LoadType.FK_NOT_FOUND,
                missingFK: MissingFK.USER_ID,
                data: [{ user_id: newUrlData.user_id }]
            };
        }

        //---------- END Table 檢查 ----------//

        // 該短網址進行建立
        const query = `
            INSERT INTO UrlData (
            user_id,
            
            short_url,
            long_url,
            created_at,
            expire_date,
            require_password,
            password
            )
            VALUES(
                ${newUrlData.user_id},

                "${newUrlData.short_url}",
                "${newUrlData.long_url}",
                Now(),
                ${newUrlData.expire_date},
                ${newUrlData.require_password},
                ${newUrlData.password}
            );
        `;
        console.log('query', query);
        result = await db.query(query);
        console.log('insertQuery', result);
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