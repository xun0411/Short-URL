import { HashGenerator } from "../HashGenerator/HashGenerator.js";
import type { Database } from "../database/Maria.js";


export interface UserData {
    id: number;                 // User id, 作 FK 給 Session table
    user_permissions: number;   // 該 session 的使用者權限
}

export class Authorizer {
    #hash: HashGenerator;
    #db: Database;

    constructor(salt: string, db: Database) {
        this.#hash = new HashGenerator(salt);
        this.#db = db;
    }


    /**
     * 進行登入, 回傳該使用者權限等級
     * @param username - account name
     * @param password - account password
     * @returns {Promise<UserData | false>} - permissions number or login failed
     */
    public async login(username: string, password: string): Promise<UserData | false> {
        const hashPassword = this.#hash.generateHash(password);
        const result = await this.#db.query(`SELECT id, user_permissions FROM User WHERE username = "${username}" AND password = "${hashPassword}" AND registered = 1;`);
        
        if (result.length === 0) {
            return false
        }

        return result[0] as UserData;
    }

    /**
     * 驗證帳號密碼是否正確, 只回傳是否能成功登入
     * @param username - account name
     * @param password - account password
     * @returns {Promise<boolean>}
     */
    public async verifyLogin(username: string, password: string): Promise<boolean> {
        const hashPassword = this.#hash.generateHash(password);
        const result = await this.#db.query(`SELECT COUNT(*) FROM User WHERE username = "${username}" AND password = "${hashPassword}" AND registered = 1;`);

        // result data: [ { 'COUNT(*)': 1n } ],  1n is BigInt
        const count = Number((result[0] as any)['COUNT(*)']);
        return count > 0 ? true : false;
    }

    /**
     * Hash password
     * 塞入資料庫前需 hash password
     * @param password - password
     * @returns {string} - hashed password
     */
    public hashPassword(password: string): string {
        return this.#hash.generateHash(password);
    }
}
