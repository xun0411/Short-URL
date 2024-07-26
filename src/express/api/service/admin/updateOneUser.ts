/**
 * 更新 User table 的 一名使用者
 * 給管理員用的 (後台更新使用者)
 * 未註冊驗證帳號也能更改
 */
export const path = '/api/service/admin/updateOneUser';
export const method = 'PUT';
export const loginRequired = true;
export const allowPermissions = [UserPermissions.Admin];

import { emptyDataConvert } from "../../../../util/validDataConverter.js";
import { rangeCheck } from "../../../../util/rangeCheck.js";
import { LoadType, UserPermissions } from "../../../../@types/Express.types.js";

import type { Request, Response } from 'express';
import type { Database } from '../../../../lib/database/Maria.js';
import type { SessionManager } from '../../../../lib/SessionManager/SessionManager.js';
import type { ApiConfig } from '../../../../@types/Config.types.js';
import type { ResultData } from "../../../../@types/Express.types.js";


/**
 * 就算其中一個沒有要更改也需帶舊值進來
 * username         (不能更改)
 * name
 * email
 */

export async function execute(req: Request, res: Response, config: ApiConfig, db: Database, sessionManager: SessionManager): Promise<ResultData> {
    let result: object[] = [];

    // 參數檢查
    if (
        (typeof (req.body.username) !== 'string' || !rangeCheck.string_length(req.body.username, 100)) ||
        (typeof (req.body.name) !== 'string' || !rangeCheck.string_length(req.body.name, 100)) ||
        (typeof (req.body.email) !== 'string' || !rangeCheck.string_length(req.body.email, 100))
    ) {
        return {
            loadType: LoadType.PARAMETER_ERROR,
            data: []
        };
    }


    try {
        /**
         * 檢查帳號是否存在
         */
        const accountQuery = `SELECT COUNT(*) FROM user WHERE username = "${req.body.username}";`;
        result = await db.query(accountQuery);
        const count = Number((result[0] as any)['COUNT(*)']);

        if (count <= 0) {
            return {
                loadType: LoadType.ACCOUNT_NOT_EXISTS,
                data: [
                    {
                        username: req.body.username
                    }
                ]
            };
        }


        /**
         * 更新指定帳號資訊
         */
        const query = `
            UPDATE user
            SET 
                name = "${req.body.name}",
                email = "${req.body.email}"
            WHERE 
                username = "${req.body.username}";
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