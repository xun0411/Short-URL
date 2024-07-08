import { createHash, randomBytes } from 'crypto';


export class HashGenerator {
    #salt: string;

    /**
     * @param {string} salt - Salt value
     */
    constructor(salt: string) {
        this.#salt = salt;
    }


    /**
     * Generate hash password using SHA-512 algorithm
     * @param {string} password - The password to be hashed.
     * @returns {string} - The hashed password.
     */
    public generateHash(password: string): string {
        return createHash('sha512')
            .update(password + this.#salt, 'utf-8')
            .digest('hex');
    }

    /**
     * Generates a random string of specified length.
     * @static
     * @param {number} length - The length of the string to generate.
     * @returns {string} - A randomly generated key.
     */
    public static generateRandomKey(length: number): string {
        return randomBytes(Math.ceil(length / 2)).toString('hex');
    }
}