/**
 * 刪除 User table 的 一名使用者
 * 給管理員用的 
 * 後台刪除使用者
 */
export const path = '/api/service/admin/deleteOneUser';
export const method = 'DELETE';
export const loginRequired = true;
export const allowPermissions = [UserPermissions.Admin];

import { rangeCheck } from "../../../../util/rangeCheck.js";
import { LoadType, UserPermissions } from "../../../../@types/Express.types.js";

import type { Request, Response } from 'express';
import type { Database } from '../../../../lib/database/Maria.js';
import type { SessionManager } from '../../../../lib/SessionManager/SessionManager.js';
import type { ApiConfig } from '../../../../@types/Config.types.js';
import type { ResultData } from "../../../../@types/Express.types.js";

export async function execute(req: Request, res: Response, config: ApiConfig, db: Database, sessionManager: SessionManager): Promise<ResultData> {
    let result: object[] = [];

    // 參數檢查
    if ((typeof (req.body.username) !== 'string' || !rangeCheck.string_length(req.body.username, 100))) {
        return {
            loadType: LoadType.PARAMETER_ERROR,
            data: []
        };
    }

    try {
        /**
         * result: OkPacket { affectedRows: 1, insertId: 0n, warningStatus: 0 }
         */
        const accountQuery = `DELETE FROM user WHERE username = "${req.body.username}";`;
        result = await db.query(accountQuery);
        const affectedRows = Number((result as any)['affectedRows'] ?? -1);

        // 帳號不存在
        if (affectedRows <= 0) {
            return {
                loadType: LoadType.ACCOUNT_NOT_EXISTS,
                data: [
                    {
                        username: req.body.username
                    }
                ]
            };
        }
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