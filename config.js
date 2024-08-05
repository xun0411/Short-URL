/**
 * 配置檔 (所有值須設置否則會出錯)
 * 
 * @type {import("./src/@types/Config.types.js").Config} - config
 * 
 * @param {Object} apiConfig - api 設置及開關
 * @param {string} apiConfig.host - api host
 * @param {number} apiConfig.port - api port
 * @param {Object} apiConfig.enableModule - 是否啟用子模塊
 * @param {boolean} apiConfig.enableModule.register - 是否啟用註冊 api
 * @param {boolean} apiConfig.enableModule.mailer - 是否啟用 mailer api
 * 
 * @param {Object} IPBlocker - IPBlocker config
 * @param {number} IPBlocker.retryLimit - 重試次數 (default: 5)
 * @param {number} IPBlocker.unlockTimeoutDuration - 封鎖時間(ms) (default: 5 minutes)
 * @param {number} IPBlocker.cleanupInterval - 定時清理器時間(ms) (default: 5 minutes)
 * 
 * @param {Object} mailer - Mail server 設置
 * @param {string} mailer.host - smtp 伺服器位置
 * @param {number} mailer.port - smtp 伺服器 port (defaults to 25 or 465)
 * @param {boolean} mailer.secure - defines if the connection should use SSL (if true) or not (if false)
 */
const config = {
    apiConfig: {
        host: '127.0.0.1',
        port: 4000,
        enableModule: {
            register: true,
            mailer: true
        }
    },
    ipBlocker: {
        retryLimit: 5,
        unlockTimeoutDuration: 5 * 60 * 1000,
        cleanupInterval: 5 * 60 * 1000
    },
    mailer: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true
    }
};

export { config };