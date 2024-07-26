/**
 * 獲取 User table 的一名使用者個人資料
 * 給管理員用的 
 * 後台管理使用者
 */
export const path = '/api/service/admin/getOneUser';
export const method = 'GET';
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
    if ((typeof (req.query.username) !== 'string' || !rangeCheck.string_length(req.query.username, 100))) {
        return {
            loadType: LoadType.PARAMETER_ERROR,
            data: []
        };
    }

    const reqUsername = String(req.query.username);

    try {
        const query = `
            SELECT 
                username,
                user_permissions,
                name,
                email,
                registered
            FROM user 
            WHERE username = "${reqUsername}";
        `;
        result = await db.query(query);
        
        // 帳號不存在
        if (result.length === 0) {
            return {
                loadType: LoadType.ACCOUNT_NOT_EXISTS,
                data: [
                    {
                        username: reqUsername
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
        data: result
    };
}