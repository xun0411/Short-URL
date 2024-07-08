import { randomBytes } from 'crypto';
import { Authorizer } from './Authorizer.js';
import { IPBlacklist } from './IPBlacklist.js';
import { IPBlocker } from "./IPBlocker.js";

import type { Database } from '../database/Maria.js';
import type { IPBlockerConfig } from '../../@types/Config.types.js';


export interface SessionData {
    username: string            // 登入的帳號名稱
    user_permissions: number;   // 該 session 的使用者權限
    createdAt: number;          // Create time (ms)
}


export class SessionManager {
    public auth: Authorizer;
    public ipBlocker: IPBlocker;
    public ipBlacklist: IPBlacklist;

    #db: Database;


    /**
     * @param {Authorizer} auth - Authorizer instance
     * @param {IPBlockerConfig} ipBlockerConfig - IP blocker config
     */
    constructor(auth: Authorizer, db: Database, ipBlockerConfig?: IPBlockerConfig | undefined) {
        this.#db = db;

        this.auth = auth;
        this.ipBlacklist = new IPBlacklist(this.#db);
        this.ipBlocker = new IPBlocker(ipBlockerConfig);
    }


    /**
     * Create a new session or refresh a session
     * @param username - account name
     * @param password - account password
     * @param device - user device (User-Agent)
     * @returns {Promise<string | false>} - Session id or login failed
     */
    public async createSession(username: string, password: string, device: string): Promise<string | false> {
        const userData = await this.auth.login(username, password);

        if (!userData) {
            return false;
        }


        let sessionId = this.#generateSessionKey();
        let isDuplicate = true;

        try {
            while (isDuplicate) {
                const checkQuery = `SELECT COUNT(*) AS count FROM Session WHERE session_id = "${sessionId}";`;
                const result = await this.#db.query(checkQuery);

                if (Number((result[0] as any).count) === 0) {
                    isDuplicate = false;
                }
                else {
                    sessionId = this.#generateSessionKey();
                }
            }

            const query = `
                INSERT INTO Session (
                    session_id, 
                    user_id, 
                    device, 
                    last_refresh
                )
                VALUES(
                    "${sessionId}", 
                    "${userData.id}", 
                    "${device}", 
                    current_timestamp()
                );
            `;
            const result = await this.#db.query(query);

        } catch (error) {
            console.log(error);
            return false;
        }

        return sessionId;
    }

    /**
     * Check if the session exists
     * @param {string} sessionId - Session id
     * @returns {Promise<boolean>}
     */
    public async checkSession(sessionId: string): Promise<boolean> {
        const checkQuery = `SELECT COUNT(*) AS count FROM Session WHERE session_id = "${sessionId}";`;
        const result = await this.#db.query(checkQuery);

        return Number((result[0] as any).count) > 0 ? true : false;
    }

    /**
     * Destroy session
     * @param {string} sessionId - Session id
     * @returns {Promise<boolean>}
     */
    public async destroySession(sessionId: string): Promise<boolean> {
        const checkQuery = `DELETE FROM Session WHERE session_id = "${sessionId}";`;
        const result = await this.#db.query(checkQuery);

        return true
    }

    /**
     * Refresh an existing session
     * @param {string} sessionId - Session id
     * @returns {Promise<boolean>}
     */
    public async refreshSession(sessionId: string): Promise<boolean> {
        const checkQuery = `UPDATE Session SET last_refresh=current_timestamp() WHERE session_id = "${sessionId}";`;
        const result = await this.#db.query(checkQuery);

        return true;
    }

    /**
     * Get the session if the session exists
     * @param {string} sessionId - Session id
     * @returns {Promise<SessionData | false>}
     */
    public async getSession(sessionId: string): Promise<SessionData | false> {
        const checkQuery = `
            SELECT 
                User.username, 
                User.user_permissions, 
                Session.last_refresh
            FROM 
                Session
            JOIN 
                User ON Session.user_id = User.id
            WHERE 
                Session.session_id = "${sessionId}";
        `;
        const result = await this.#db.query(checkQuery);

        return result.length === 0 ? false : result[0] as SessionData;
    }

    /**
     * Generate a 64-character session key
     * @private
     * @returns {string}
     */
    #generateSessionKey(): string {
        return randomBytes(32).toString('hex');
    }
}
