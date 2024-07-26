/**
 * 更新 User table 的 一名使用者的權限
 * 給管理員用的 
 * 後台確認註冊使用者並發放權限或修改
 */
export const path = '/api/service/admin/updateOneUserPermissions';
export const method = 'PUT';
export const loginRequired = true;
export const allowPermissions = [UserPermissions.Admin];


import { rangeCheck } from "../../../../util/rangeCheck.js";
import { LoadType, UserPermissions } from "../../../../@types/Express.types.js";

import type { Request, Response } from 'express';
import type { Database } from '../../../../lib/database/Maria.js';
import type { SessionManager } from '../../../../lib/SessionManager/SessionManager.js';
import type { ApiConfig } from '../../../../@types/Config.types.js';
import type { ResultData } from "../../../../@types/Express.types.js";

/**
 * username
 * user_permissions
 * registered
 */

export async function execute(req: Request, res: Response, config: ApiConfig, db: Database, sessionManager: SessionManager): Promise<ResultData> {
    let result: object[] = [];

    // 參數檢查
    if (
        (typeof (req.body.username) !== 'string' || !rangeCheck.string_length(req.body.username, 100)) ||
        (typeof (req.body.user_permissions) !== 'number' || !Object.values(UserPermissions).filter(value => typeof value === 'number').includes(req.body.user_permissions)) ||
        !Number.isInteger(Number(req.body.registered)) || ![0, 1].includes(Number(req.body.registered))
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
        const accountQuery = `SELECT COUNT(*) FROM User WHERE username = "${req.body.username}";`;
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
                user_permissions = ${req.body.user_permissions},
                registered = ${req.body.registered}
            WHERE  username = "${req.body.username}";
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