import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { EventEmitter } from 'events';

import bodyParser from 'body-parser';
import cookie from "cookie";
import express, { Request, Response } from 'express';
import { LoadType } from '../@types/Express.types.js';

import type { Database } from '../lib/database/Maria.js';
import type { Mailer } from '../lib/Mailer/Mailer.js';
import type { SessionManager } from '../lib/SessionManager/SessionManager.js';
import type { ApiConfig } from '../@types/Config.types.js';
import type { EventListeners, Route, UserPermissions } from '../@types/Express.types.js';


export interface AppEvents {
    once: EventListeners<this>;
    on: EventListeners<this>;
}


export class App extends EventEmitter implements AppEvents {
    public config: ApiConfig;

    #app;                               // Express
    #db: Database;                      // Database
    #routes: Route[] = [];              // Routes cache
    #mailer: Mailer | null;             // Mail send
    #sessionManager: SessionManager;    // Session manager


    constructor(config: ApiConfig, db: Database, sessionManager: SessionManager, mailer: Mailer | null) {
        super();
        this.config = config;

        this.#db = db;
        this.#mailer = mailer;
        this.#sessionManager = sessionManager;

        this.#app = express();
        this.#setMiddleware();
    }


    /**
     * set up the Express middleware
     * @private
     */
    #setMiddleware(): void {
        this.#app.use(bodyParser.json());
        this.#app.use(bodyParser.urlencoded({ extended: true }));
        // this.#app.use(cors());

        this.emit('debug', 'Set express middleware succeeded');
    }

    /**
     * start express framework
     */
    public startListening(): void {
        this.#app.listen(this.config.port, this.config.host, () => {
            this.emit('debug', `Server listening on http://${this.config.host}:${this.config.port}`);
        });
    }

    /**
     * Set up the routes for the application
     * @returns {Promise<void>}
     */
    public async setRoutes(): Promise<void> {
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const apiPath = path.join(__dirname, 'api');

        const stack = [apiPath];
        const registeredPaths = new Set<string>();

        this.emit('debug', '---------- loading routes ----------');

        while (stack.length > 0) {
            const currentPath = stack.pop();
            const files = await fs.promises.readdir(currentPath!, { withFileTypes: true });

            for (const file of files) {
                const filePath = path.join(currentPath!, file.name);

                if (file.isDirectory()) {
                    stack.push(filePath);
                }
                else if (file.name.endsWith('.ts') || file.name.endsWith('.js')) {
                    const routePath = path.join('file://', filePath);
                    const route: Route = await import(routePath);

                    // 檢查路徑是否已註冊
                    if (registeredPaths.has(route.path)) {
                        throw new Error(`Duplicate API detected, please ensure all API paths are unique. API: ${route.path}. File path: ${filePath}.`);
                    }

                    registeredPaths.add(route.path);
                    this.#routes.push(route);

                    this.emit('debug', `${route.method}\t${route.path}`);
                }
            }
        }

        registeredPaths.clear();

        this.emit('debug', '---------- loading routes finished ----------');

        this.#registerRoutes();
    }

    /**
     * Register the routes in the Express app
     * @private
     */
    #registerRoutes() {
        this.emit('debug', '---------- registering routes ----------');

        for (const routeModule of this.#routes) {
            const { path, method, loginRequired, allowPermissions, execute } = routeModule;

            switch (method) {
                case 'GET': {
                    if (loginRequired) {
                        this.#app.get(path, this.#checkIPBlacklist(), this.#authenticateLogin(allowPermissions), this.#handleRouteExecution(execute));
                    }
                    else {
                        this.#app.get(path, this.#checkIPBlacklist(), this.#handleRouteExecution(execute));
                    }
                    this.emit('debug', `${method}\t${path}`);
                    break;
                }
                case 'POST': {
                    if (loginRequired) {
                        this.#app.post(path, this.#checkIPBlacklist(), this.#authenticateLogin(allowPermissions), this.#handleRouteExecution(execute));
                    }
                    else {
                        this.#app.post(path, this.#checkIPBlacklist(), this.#handleRouteExecution(execute));
                    }
                    this.emit('debug', `${method}\t${path}`);
                    break;
                }
                case 'PUT': {
                    if (loginRequired) {
                        this.#app.put(path, this.#checkIPBlacklist(), this.#authenticateLogin(allowPermissions), this.#handleRouteExecution(execute));
                    }
                    else {
                        this.#app.put(path, this.#checkIPBlacklist(), this.#handleRouteExecution(execute));
                    }
                    this.emit('debug', `${method}\t${path}`);
                    break;
                }
                case 'DELETE': {
                    if (loginRequired) {
                        this.#app.delete(path, this.#checkIPBlacklist(), this.#authenticateLogin(allowPermissions), this.#handleRouteExecution(execute));
                    }
                    else {
                        this.#app.delete(path, this.#checkIPBlacklist(), this.#handleRouteExecution(execute));
                    }
                    this.emit('debug', `${method}\t${path}`);
                    break;
                }
                default: {
                    throw new Error(`Invalid HTTP method "${method}" for route: ${path}`);
                }
            }
        }

        this.#app.all('*', this.#checkIPBlacklist(), this.#handleRouteNotFoundError);

        this.emit('debug', '---------- registering routes finished ----------');
        this.emit('debug', `Loaded API: ${this.#routes.length}`);
    }

    /**
     * Middleware for login authentication
     * @private
     */
    #authenticateLogin(requiredPermissions: UserPermissions[]): (req: Request, res: Response, next: () => void) => void {
        return async (req: Request, res: Response, next: () => void): Promise<void> => {
            const cookies = cookie.parse(req.headers.cookie as string || '');
            const cookieSessionId = cookies.sessionId;

            if (!cookieSessionId) {
                // 如果 session 不存在，返回未授權的錯誤
                res.json({
                    status: 401,
                    loadType: LoadType.UNAUTHORIZED,
                    data: []
                });

                this.emit('requestFail', (req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.ip), 'UNAUTHORIZED', req.path);
                return;
            }


            const session = await this.#sessionManager.getSession(cookieSessionId);

            if (!session) {
                res.json({
                    status: 401,
                    loadType: LoadType.UNAUTHORIZED,
                    data: []
                });

                this.emit('requestFail', (req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.ip), 'UNAUTHORIZED', req.path);
                return;
            }


            // 刷新 user session
            await this.#sessionManager.refreshSession(cookieSessionId);

            // 如果 session 存在，並且用戶擁有足夠的權限，允許訪問
            if (this.#checkPermissions(session.user_permissions, requiredPermissions)) {
                next();
            }
            // 如果權限不足，返回未授權的錯誤
            else {
                res.json({
                    status: 403,
                    loadType: LoadType.FORBIDDEN,
                    data: []
                });

                this.emit('requestFail', (req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.ip), 'FORBIDDEN', req.path);
                return;
            }
        }
    }

    /**
     * 檢查請求 IP 是否存在 blacklist 中
     * @private
     */
    #checkIPBlacklist(): (req: Request, res: Response, next: () => void) => void {
        return async (req: Request, res: Response, next: () => void): Promise<void> => {
            const userIp = (req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.ip) as string;

            const isBlacklist = await this.#sessionManager.ipBlacklist.checkIp(userIp);

            if (isBlacklist) {
                this.emit('warn', `Request from ip blacklist ${userIp} are blocked.`);
                return;
            }
            else {
                next();
            }
        }
    }

    /**
     * 檢查使用者是否擁有所需的權限
     * @private
     * @param {UserPermissions} userPermissions - 使用者權限
     * @param {UserPermissions[]} requiredPermissions - 目標 API 所允許的權限列表
     */
    #checkPermissions(userPermissions: UserPermissions, requiredPermissions: UserPermissions[]): boolean {
        // 如果 requiredPermissions 為空，則所有人都有權限
        if (requiredPermissions.length === 0) {
            return true;
        }

        // 檢查使用者權限是否包含所需的權限之一
        return requiredPermissions.includes(userPermissions);
    }

    /**
     * Handle the execution of the route
     * @private
     * @param {Function} execute - The route execution function
     * @returns {Function} - The route handling function
     */
    #handleRouteExecution(execute: Route["execute"]): (req: Request, res: Response) => Promise<void> {
        return async (req: Request, res: Response): Promise<void> => {
            this.emit('request', req);

            try {
                const result = await execute(req, res, this.config, this.#db, this.#sessionManager, this.#mailer);
                res.json(result);

                this.emit('response', res);
            } catch (error) {
                this.emit('error', error);
                this.#handleServerError(res, error);
            }
        };
    }

    /**
     * Handle unmatched paths
     * @private
     */
    #handleRouteNotFoundError(req: Request, res: Response): void {
        res.json({
            status: 404,
            loadType: LoadType.PATH_ERROR,
            data: []
        });
    }

    /**
     * Handle unmatched paths
     * @private
     */
    #handleServerError(res: Response, error: any): void {
        res.status(500).json({
            status: 500,
            loadType: LoadType.SERVER_ERROR,
            error: error
        });
    }
}