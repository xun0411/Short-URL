import type { Database } from "../database/Maria.js";


export interface BlacklistData {
    ip: string;             // IP address
    created_at: string;     // YYYY-MM-DD HH:MI:SS
}


export class IPBlacklist {
    #db: Database;

    constructor(db: Database) {
        this.#db = db;
    }


    /**
     * 添加 IP 至 blacklist 中
     * @param {string} ip - IP address
     * @returns {Promise<void>}
     */
    public async addIp(ip: string): Promise<void> {
        const query = `
            IF NOT EXISTS (
                SELECT 1 
                FROM IPBlacklist 
                WHERE ip = "${ip}"
            ) THEN
                INSERT INTO IPBlacklist (ip, created_at) VALUES ("${ip}", NOW());
            END IF;
        `;
        await this.#db.query(query);
    }

    /**
     * 檢查是否存在 IP blacklist 中
     * @param {string} ip - IP address
     * @returns {Promise<boolean>}
     */
    public async checkIp(ip: string): Promise<boolean> {
        const query = `SELECT COUNT(*) AS count FROM IPBlacklist WHERE ip = "${ip}" LIMIT 1;`;
        const result = await this.#db.query(query);

        return Number((result[0] as any).count) > 0 ? true : false;
    }

    /**
     * 刪除 blacklist 中的 IP
     * @param {string} ip - IP address
     * @returns {Promise<void>}
     */
    public async deleteIp(ip: string): Promise<void> {
        const query = `DELETE FROM IPBlacklist WHERE ip = "${ip}";`;
        await this.#db.query(query);
    }

    /**
     * 獲取整個 blacklist
     * @returns {Promise<BlacklistData[]>}
     */
    public async getBlacklist(): Promise<BlacklistData[]> {
        const query = `SELECT ip, created_at FROM IPBlacklist;`;
        const result = await this.#db.query(query);

        return result as BlacklistData[];
    }
}
