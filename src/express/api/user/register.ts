/**
 * 註冊一個新使用者
 */
export const path = '/api/user/register';
export const method = 'POST';
export const loginRequired = false;
export const allowPermissions = [];

import { rangeCheck } from "../../../util/rangeCheck.js";
import { LoadType, UserPermissions } from '../../../@types/Express.types.js';

import type { Request, Response } from 'express';
import type { Database } from '../../../lib/database/Maria.js';
import type { SessionManager } from '../../../lib/SessionManager/SessionManager.js';
import type { ApiConfig } from "../../../@types/Config.types.js";
import type { ResultData } from "../../../@types/Express.types.js";

interface User{
    id?: number;

    username: string;               //使用者名稱    string(100)
    password: string;               //密碼
    user_permissions: number;       //使用者權限    (INT_UNSIGNED)
    name: string;                   //姓名          string(100)
    email: string;                  //郵件          string(100)
}

export async function execute(req: Request, res: Response, config: ApiConfig, db: Database, sessionManager: SessionManager): Promise<ResultData> {
    let result: object[] = [];

    if (
        (typeof (req.body.username) !== 'string' || !rangeCheck.string_length(req.body.username, 100)) ||
        (typeof (req.body.password) !== 'string' || !rangeCheck.string_length(req.body.password, 100)) ||
        (typeof (req.body.name) !== 'string' || !rangeCheck.string_length(req.body.name, 100)) ||
        (typeof (req.body.email) !== 'string' || !rangeCheck.string_length(req.body.email, 100))
    ) {
        return {
            loadType: LoadType.PARAMETER_ERROR,
            data: []
        };
    }

    /**
     * 是否已禁用註冊 API
     */
    if (!config.enableModule.register) {
        return {
            loadType: LoadType.DISABLE,
            data: []
        };
    }

    const newUser = {
        username: req.body.username,
        password: sessionManager.auth.hashPassword(req.body.password),
        name: req.body.name,
        email: req.body.email
    };

    try {
        /**
         * 檢查帳號衝突
         */
        const accountQuery = `SELECT COUNT(*) FROM User WHERE username = "${req.body.username}";`;
        result = await db.query(accountQuery);
        const count = Number((result[0] as any)['COUNT(*)']);

        if (count > 0) {
            return {
                loadType: LoadType.ACCOUNT_EXISTS,
                data: []
            };
        }

        /**
         * user_permissions 預設為 None (0)，等管理員驗證發權限 (user_permissions 為 None 就算開通帳號 (registered = 1) 也會無法登入)
         * registered 預設為 0，表示待驗證，等管理員確認
         * 管理員需開通帳號並設置權限帳號才有使用權線
         */
        const defaultData = {
            user_permissions: UserPermissions.None,
            registered: 0
        };

        const query = `
            INSERT INTO User (
                username, 
                password, 
                user_permissions,
                name, 
                email,
                registered
            )
            VALUES (
                "${newUser.username}",
                "${newUser.password}",
                ${defaultData.user_permissions},
                "${newUser.name}",
                "${newUser.email}",
                ${defaultData.registered}
            );
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