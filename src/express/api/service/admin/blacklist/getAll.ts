/**
 * 獲取 IP blacklist
 * 管理員後台用
 * 添加進 blacklist 的 IP 所發出的請求都會被忽略
 */
export const path = '/api/service/admin/blacklist/getAll';
export const method = 'GET';
export const loginRequired = true;
export const allowPermissions = [UserPermissions.Admin];

import { UserPermissions } from "../../../../../@types/Express.types.js";
import { LoadType } from '../../../../../@types/Express.types.js';

import type { Request, Response } from 'express';
import type { Database } from '../../../../../lib/database/Maria.js';
import type { SessionManager } from '../../../../../lib/SessionManager/SessionManager.js';
import type { ApiConfig } from '../../../../../@types/Config.types.js';
import type { ResultData } from "../../../../../@types/Express.types.js";


export async function execute(req: Request, res: Response, config: ApiConfig, db: Database, sessionManager: SessionManager): Promise<ResultData> {
    let result: object[] = [];

    try {
        result = await sessionManager.ipBlacklist.getBlacklist();
    } catch (error) {
        console.log(path, error);
        return {
            loadType: LoadType.QUERY_FAILED,
            data: []
        };
    }

    /**
     * 資料庫 DATETIME 獲取的時區為 UTC (+0:00) (2024-06-23T05:05:05.000Z)
     * 需轉換成 UTC+8 (2024-06-23 13:05:05)
     * 不在 DB 端處理時區轉換, server 端處理就好
     */
    result = result.map((item: any) => {
        item.created_at = new Date(item.created_at as string).toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
        return item;
    });

    return {
        loadType: LoadType.SUCCEED,
        data: result
    };
}