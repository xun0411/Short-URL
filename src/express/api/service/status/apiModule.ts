/**
 * 檢查 server API 模快是否啟用
 * API: { 0: All, 1: 註冊, 2: Mail }
 */
export const path = '/api/service/status/apiModule';
export const method = 'GET';
export const loginRequired = false;
export const allowPermissions = [];

import { LoadType } from '../../../../@types/Express.types.js';

import type { Request, Response } from 'express';
import type { Database } from '../../../../lib/database/Maria.js';
import type { SessionManager } from '../../../../lib/SessionManager/SessionManager.js';
import type { ApiConfig } from '../../../../@types/Config.types.js';
import type { ResultData } from "../../../../@types/Express.types.js";

export async function execute(req: Request, res: Response, config: ApiConfig, db: Database, sessionManager: SessionManager): Promise<ResultData> {


    // 參數檢查
    if (!Number.isInteger(Number(req.query.type)) || ![0, 1, 2].includes(Number(req.query.type))) {
        return {
            loadType: LoadType.PARAMETER_ERROR,
            data: []
        };
    }

    const apiType = Number(req.query.type);
    let apiEnable = false;

    if (apiType === 0) {
        return {
            loadType: LoadType.SUCCEED,
            data: [
                {
                    register: config.enableModule.register,
                    mailer: config.enableModule.mailer
                }
            ]
        };
    }
    else if (apiType === 1) {
        if (config.enableModule.register) {
            apiEnable = true;
        }
    }
    else if (apiType === 2) {
        if (config.enableModule.mailer) {
            apiEnable = true;
        }
    }


    return {
        loadType: LoadType.SUCCEED,
        data: [{ enable: apiEnable }]
    };
}