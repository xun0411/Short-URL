import type { Request, Response } from 'express';


/**
 * NLSCApiProxy events
 */
export type EventListeners<T> = {
    (event: 'debug', listener: (message: string) => void): T;
    (event: 'request', listener: (request: Request) => void): T;
    (event: 'response', listener: (response: Response) => void): T;
    (event: 'error', listener: (message: string) => void): T;
    (event: 'warn', listener: (message: string) => void): T;
}


/**
 * NLSC API 回傳的資料結構
 */
export interface ResultData {
    loadType: LoadType;
    data: Object[];
}


/**
 * NLSC API LoadType codes
 */
export enum LoadType {
    SUCCEED             = 1000,     // 成功回傳
    UNAUTHORIZED        = 1001,     // 未登入或請求 header 沒帶 sessionID
    FORBIDDEN           = 1002,     // 此 sessionID 沒權限請求
    PARAMETER_ERROR     = 1003,     // 請求參數錯誤
    PATH_ERROR          = 1004,     // 請求路徑錯誤
    DISABLE             = 1005,     // 該 API 已被禁用

    PERMISSION_DENIED   = 1006,     // 請求的 API 路徑沒被國土測繪授權或路徑錯誤或授權過期

    SERVER_ERROR        = 1050,     // 伺服器錯誤 (內部錯誤)
    QUERY_FAILED        = 1051,     // 資料庫查詢錯誤 (內部錯誤)

    // TYPE_SESSION = 3xxx
    BLOCKED_LOGIN       = 3000,     // 嘗試登入太多次 鎖定一段時間
    FAILED_LOGIN        = 3001,     // 登入失敗 (帳號或密碼錯誤)
    SESSION_EXISTS      = 3003,     // 請求時已帶入有效的 sessionId 跳過登入
    SESSION_INVALID     = 3004,     // 請求時帶入的 sessionId 無效 (可能閒置太久過期了), 可重定向至登入介面
}