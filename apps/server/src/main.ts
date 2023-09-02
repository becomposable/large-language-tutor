import { ErrorInfo } from "@koa-stack/server";
import { initializeApp } from 'firebase-admin/app';
import { Context } from "koa";
import TutorServer from "./TutorServer.js";
import Env from "./env.js";

const logger = console
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8089;

process.on('uncaughtException', function (err) {
    console.error('Uncaught error!', err.stack);
});

logger.info(`Node version: ${process.version}`);
logger.info(`Starting language tutor server on port ${PORT} ...`);

initializeApp({
    projectId: Env.google.projectId,
});

new TutorServer().withErrorHandler({
    log(ctx: Context, err: Error | object, info?: ErrorInfo) {
        if (info) {
            if (info.status >= 500) {
                logger.error(err, ctx.method, ctx.path, info.message);
            } else {
                logger.warn(err, ctx.method, ctx.path, info.message);
            }
        } else {
            logger.error(ctx.method, ctx.path, err);
        }
    }
}).start(PORT, {
    callback: () => {
        logger.info('Server started');
    }
}).catch(err => logger.error(err));
