/**
 * 建立一個新短網址
 */
export const path = '/api/urldata/CreateOne';
export const method = 'POST';
export const loginRequired = false;
export const allowPermissions = [];


import { rangeCheck } from '../../../util/rangeCheck.js';
import { LoadType, MissingFK } from '../../../@types/Express.types.js';
import { GenerateShortUrl } from '../../../lib/GenerateShortUrl/GenerateShortUrl.js';

import type { Request, Response } from 'express';
import type { Database } from '../../../lib/database/Maria.js';
import type { ApiConfig } from '../../../@types/Config.types.js';
import type { ResultData } from '../../../@types/Express.types.js';
import type { SessionManager } from '../../../lib/SessionManager/SessionManager.js';


interface UrlData {
    id?: number;
    user_id: number | null;             //引用使用者的id    (INT)

    short_url: string;                  //短網址            string(10)
    long_url: string;                   //原始網址          string(1000)
    //created_at: string;               //添加時間          Date
    expire_date: number | null;         //過期時間(分)      (INT_UNSIGNED)
    password: string | null;            //密碼              string(128)
}



export async function execute(req: Request, res: Response, config: ApiConfig, db: Database, sessionManager: SessionManager): Promise<ResultData> {
    let result: object[] = [];

    // 檢查請求參數型別是否正確
    if (
        (req.body.user_id !== null && (typeof (req.body.user_id) != 'number' || !rangeCheck.int(req.body.user_id))) ||
        (typeof (req.body.long_url) != 'string' || !rangeCheck.string_length(req.body.long_url, 1000)) ||
        (req.body.expire_date !== null && (typeof (req.body.expire_date) != 'number' || !rangeCheck.int_unsigned(req.body.expire_date))) ||
        (req.body.password !== null && (typeof (req.body.password) != 'string' || !rangeCheck.string_length(req.body.password, 128)))
    ) {
        return {
            loadType: LoadType.PARAMETER_ERROR,
            data: []
        };
    }


    // 生成一個短網址
    let isexist = false;
    let shorturl = GenerateShortUrl.generateUrl(6);

    /**
     * 檢查重複短網址&生成新短網址
     */
    while(!isexist){
        const checkQuery = `SELECT COUNT(*) FROM UrlData WHERE short_url = "${shorturl}";`;
        result = await db.query(checkQuery);
        const count = Number((result[0] as any)['COUNT(*)']);
        if (count <= 0) {
            isexist = true;
        } else {
            shorturl = GenerateShortUrl.generateUrl(6);
        }
    }


    const newUrlData = {
        user_id: req.body.user_id === 'NULL' ? 'NULL' : req.body.user_id,

        short_url: shorturl,
        long_url: req.body.long_url,
        expire_date: req.body.expire_date === 'NULL' ? 'NULL' : req.body.expire_date,
        password: req.body.password === 'NULL' ? 'NULL' : sessionManager.auth.hashPassword(req.body.password)
    };

    try {
        /**
         * 檢查此網址是否已生成過
         */
        const countQuery = `SELECT COUNT(*) FROM UrlData WHERE long_url = "${req.body.long_url}";`;
        result = await db.query(countQuery);
        const count = Number((result[0] as any)['COUNT(*)']);

        if (count > 0) {
            return {
                loadType: LoadType.DATA_EXISTED,
                data: []
            };
        }



        if (newUrlData.user_id != 'NULL') {
            // 聯合查詢 檢查要引用的外鍵存在
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
            password
            )
            VALUES(
                ${newUrlData.user_id},

                "${newUrlData.short_url}",
                "${newUrlData.long_url}",
                Now(),
                ${newUrlData.expire_date},
                ${newUrlData.password === 'NULL' ? 'NULL' : `"${newUrlData.password}"`}
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