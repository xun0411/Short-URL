/**
 * 獲取 User table 的 使用者列表
 * 管理員後台用
 * 參數可選擇 registered  boolean    (是否已驗證註冊, 0: 未驗證, 1: 已驗證)
 * 來決定是 使用者列表 頁面
 * 還是 註冊確認頁面
 * 或全部顯示
 */
export const path = '/api/service/admin/getUsers';
export const method = 'GET';
export const loginRequired = true;
export const allowPermissions = [UserPermissions.Admin];


import { UserPermissions } from "../../../../@types/Express.types.js";
import { LoadType } from '../../../../@types/Express.types.js';

import type { Request, Response } from 'express';
import type { Database } from '../../../../lib/database/Maria.js';
import type { SessionManager } from '../../../../lib/SessionManager/SessionManager.js';
import type { ApiConfig } from '../../../../@types/Config.types.js';
import type { ResultData } from "../../../../@types/Express.types.js";


export async function execute(req: Request, res: Response, config: ApiConfig, db: Database, sessionManager: SessionManager): Promise<ResultData> {
    let result: object[] = [];

    // 參數檢查
    if (!Number.isInteger(Number(req.query.type)) || ![0, 1, 2].includes(Number(req.query.type))) {
        return {
            loadType: LoadType.PARAMETER_ERROR,
            data: []
        };
    }


    try {
        /**
         * 0: 未驗證註冊 (未經管理員確認)
         * 1: 已驗證註冊
         * 2: 全部
         */
        const accType = Number(req.query.type);
        let query = 'SELECT username, user_permissions, name, email, registered FROM User;';

        if (accType === 0) {
            query = 'SELECT username, user_permissions, name, email, registered FROM User WHERE registered = 0;';
        }
        else if (accType === 1) {
            query = 'SELECT username, user_permissions, name, email, registered FROM User WHERE registered = 1;';
        }


        result = await db.query(query);
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