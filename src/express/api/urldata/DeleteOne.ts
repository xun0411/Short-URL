/**
 * 刪除其中一個短網址
 */
export const path = '/api/urldata/DeleteOne';
export const method = 'DELETE';
export const loginRequired = true;
export const allowPermissions = [];

import { LoadType } from '../../../@types/Express.types.js';
import { emptyDataConvert, emptyDataDateConvert } from '../../../util/validDataConverter.js';

import type { Request, Response } from 'express';
import type { Database } from '../../../lib/database/Maria.js';
import type { ApiConfig } from '../../../@types/Config.types.js';
import type { ResultData } from '../../../@types/Express.types.js';


export async function execute(req: Request, res: Response, config: ApiConfig, db: Database): Promise<ResultData> {
    let result: object[] = [];

    // 檢查請求參數型別是否正確
    if (typeof (req.body.id) !== 'number' || !Number.isInteger(req.body.id)) {
        return {
            loadType: LoadType.PARAMETER_ERROR,
            data: []
        };
    }


    try {
        // 先檢查短網址是否存在該資料
        const selectQuery = `SELECT COUNT(*) FROM urldata WHERE id = ${req.body.id};`;
        result = await db.query(selectQuery);
        const count = Number((result[0] as any)['COUNT(*)']);

        // 該資料不存在
        if (count <= 0) {
            return {
                loadType: LoadType.DATA_NOT_FOUND,
                data: []
            };
        }


        // 該資料存在則嘗試刪除
        const deleteQuery = `DELETE FROM urldata WHERE id = ${req.body.id};`;
        await db.query(deleteQuery);
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