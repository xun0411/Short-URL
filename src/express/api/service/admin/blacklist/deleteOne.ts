/**
 * 刪除 blacklist 中的 IP
 * 管理員後台用
 * 添加進 blacklist 的 IP 所發出的請求都會被忽略
 */
export const path = '/api/service/admin/blacklist/deleteOne';
export const method = 'DELETE';
export const loginRequired = true;
export const allowPermissions = [UserPermissions.Admin];


import { rangeCheck } from "../../../../../util/rangeCheck.js";
import { UserPermissions } from "../../../../../@types/Express.types.js";
import { LoadType } from '../../../../../@types/Express.types.js';

import type { Request, Response } from 'express';
import type { Database } from '../../../../../lib/database/Maria.js';
import type { SessionManager } from '../../../../../lib/SessionManager/SessionManager.js';
import type { ApiConfig } from '../../../../../@types/Config.types.js';
import type { ResultData } from "../../../../../@types/Express.types.js";


export async function execute(req: Request, res: Response, config: ApiConfig, db: Database, sessionManager: SessionManager): Promise<ResultData> {

    // 參數檢查
    if (
        (typeof (req.body.ip) !== 'string' || !rangeCheck.string_length(req.body.ip, 45))) {
        return {
            loadType: LoadType.PARAMETER_ERROR,
            data: []
        };
    }


    try {
        await sessionManager.ipBlacklist.deleteIp(req.body.ip);
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