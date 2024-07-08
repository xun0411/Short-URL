import nodemailer from 'nodemailer';

import type SMTPTransport from 'nodemailer/lib/smtp-transport/index.js';
import type { MailerConfig } from '../../@types/Config.types.js';


export class Mailer {
    #transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;
    #user: string;

    constructor(config: MailerConfig, user: string, password: string) {
        this.#transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.secure,
            auth: {
                user: user,
                pass: password,
            },
        });

        this.#user = user;
    }


    /**
     * 發送郵件
     * @param {string} targetUser - 目標 email
     * @param {string} title - 信件標題
     * @param {string} content - 信件內容, 可使用 html 格式
     * @returns {Promise<boolean>} - 是否寄送成功
     */
    public async send(targetUser: string, title: string, content: string): Promise<boolean> {
        return new Promise(async (resolve, _reject) => {
            try {
                await this.#transporter.sendMail({
                    from: this.#user,
                    to: targetUser,
                    subject: title,
                    html: content,
                });
                resolve(true);
            } catch (error) {
                console.log('Mailer error:', error);
                resolve(false);
            };
        });
    }

    /**
     * 發送重設密碼郵件
     * @param targetUser - 目標 email
     * @param newPassword - 重設的新密碼
     * @returns {Promise<boolean>} - 是否寄送成功
     */
    public async sendResetPassword(targetUser: string, newPassword: string): Promise<boolean> {
        const title = '契作農地 密碼重設';
        const content = `新密碼: ${newPassword}`;

        return await this.send(targetUser, title, content);
    }

    /**
     * 發送註冊驗證信件
     * @param targetUser - 目標 email
     */
    public async sendVerifyRegister(targetUser: string) {
        // 目前先由 admin 手動驗證註冊
    }
}