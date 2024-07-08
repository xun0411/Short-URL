import mariadb from 'mariadb';


export class Database {
    #pool: mariadb.Pool;

    constructor(config: string | mariadb.PoolConfig) {
        this.#pool = mariadb.createPool(config);
    }


    /** 
     * Get mariadb connection
     * @private
     */
    async #getConnection() {
        return await this.#pool.getConnection();
    }

    /**
     * Execute SQL query
     * @param {string} sql - The SQL query string to be executed.
     * @throws - If there is an error executing the query, an error is thrown.
     * @returns {Promise<object[]>} - A promise that resolves with an array of rows matching the query.
     */
    public async query(sql: string): Promise<object[]> {
        let conn;
        try {
            conn = await this.#getConnection();
            const rows = await conn.query(sql);
            return rows;
        }
        catch (error) {
            throw error;
        }
        finally {
            if (conn) await conn.release();
        }
    }
}