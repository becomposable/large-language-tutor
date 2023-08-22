import { KoaServer } from "@koa-stack/server";
import compress from "koa-compress";
import ApiRoot from "./api/index.js";
import cors from '@koa/cors';
import Database from "./database.js";

export default class TutorServer extends KoaServer {

    db: Database;

    constructor() {
        super();
        // this.koa.proxy = Config.net.proxy;
        // this.koa.keys = [Config.auth.sessionSecretKey];
        this.db = new Database();
        //TODO rename to pathParams
        Object.defineProperty(this.koa.context, 'params', {
            get() { return this.$router.params; }
        });
    }

    setup() {
        //enable compression
        this.use(compress({
            threshold: 1024 * 3,
        }));

        this.use(cors());

        this.withLazyBody({
            formidable: {
                //uploadDir: , // default is os.tmpdir()
                //maxFileSize: , // in bytes
                //multiples: false,
                keepExtensions: true,
            },
            limit: '10mb',
        }).withWebRoot('./web');

        // add sentry tracing if enabled
        // if (tracingMiddleWare) {
        //     logger.info('Sentry tracing enabled');
        //     this.use(tracingMiddleWare);
        // } else {
        //     logger.info('Sentry tracing is not enabled');
        // }

        // add trebble middleware if environment is staging or production
        /*if (Config.isProdEnv || Config.isDevEnv) {
            logger.info('Treblle middleware enabled');
            const treblle = require('@treblle/koa')
            this.use(treblle());
        } else {
            logger.info('Treblle middleware is not enabled');
        }*/

        //const apiRouter = 
        this.mount('/api/v1', ApiRoot);
        //apiRouter.use(authMiddleware);

    }

    async onStart() {
        await this.db.start();
    }

    async onStop() {
        await this.db.stop();
    }
}
