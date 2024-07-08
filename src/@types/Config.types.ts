/**
 * Server config
 */
export type Config = {
    apiConfig: ApiConfig;
    ipBlocker: IPBlockerConfig
    mailer: MailerConfig;
}

/**
 * api 設置及開關
 * @param {string} host - host (應設置為 localhost)
 * @param {number} port - port
 * @param {Object} enableModule - 是否啟用子模塊
 * @param {boolean} enableModule.register - 是否啟用註冊 api
 * @param {boolean} enableModule.mailer - 是否啟用 mailer api
 */
export type ApiConfig = {
    host: string;
    port: number;
    enableModule: {
        register: boolean;
        mailer: boolean;
    }
}

/**
 * IPBlocker config
 * @param {number} retryLimit - 重試次數
 * @param {number} unlockTimeoutDuration - 封鎖時間(ms)
 * @param {number} cleanupInterval - 定時清理器時間(ms)
 */
export type IPBlockerConfig = {
    retryLimit: number;
    unlockTimeoutDuration: number;
    cleanupInterval: number;
}

/**
 * Mail server 設置
 * @param {string} host - smtp 伺服器位置
 * @param {number} port - smtp 伺服器 port (defaults to 25 or 465)
 * @param {boolean} secure - defines if the connection should use SSL (if true) or not (if false)
 */
export type MailerConfig = {
    host: string;
    port: number;
    secure: boolean;
}




/**
 * Enviornment config
 */
export interface EnvConfig {
    salt: string;
    dbConfig: DBConfig;
    smtpConfig: SmtpConfig;
}

/**
 * Database config
 */
export interface DBConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
}

/**
 * SMTP account config
 */
export interface SmtpConfig {
    user: string;
    password: string;
}