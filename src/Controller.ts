import { App } from "./express/App.js";
import { Authorizer } from "./lib/SessionManager/Authorizer.js";
import { Database } from "./lib/database/Maria.js";
import { SessionManager } from "./lib/SessionManager/SessionManager.js";
import { Mailer } from "./lib/Mailer/Mailer.js";
import { loadEnviornment } from "./loader/loadEnviornment.js";

import { config } from "../config.js";

import type { Config } from "./@types/Config.types.js";


export class Controller {
    public config: Config;
    public app?: App;
    public mailer: Mailer | null;

    #db: Database;
    #sessionManager: SessionManager;


    constructor() {
        this.config = config;
        const env = loadEnviornment();

        this.#db = new Database(env.dbConfig);
        this.#sessionManager = new SessionManager(new Authorizer(env.salt, this.#db), this.#db, this.config.ipBlocker);
        this.mailer = this.config.apiConfig.enableModule.mailer ? new Mailer(this.config.mailer, env.smtpConfig.user, env.smtpConfig.password) : null;
        this.app = new App(this.config.apiConfig, this.#db, this.#sessionManager, this.mailer);
    }


    /**
     * 啟動 express 框架
     */
    public async initializeExpress(): Promise<void> {
        await this.app?.setRoutes();
        this.app?.startListening();
    }

    /**
     * 之後可以加 redis 之類的在這邊初始化
     */
}