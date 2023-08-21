import TutorServer from "./TutorServer.js";
const logger = console;
const PORT = 8089;
process.on('uncaughtException', function (err) {
    console.error('Uncaught error!', err.stack);
});
logger.info(`Node version: ${process.version}`);
logger.info(`Starting language tutor server on port ${PORT} ...`);
new TutorServer().withErrorHandler({
    log(ctx, err, info) {
        if (info) {
            if (info.status >= 500) {
                logger.error(err, ctx.method, ctx.path, info.message);
            }
            else {
                logger.warn(err, ctx.method, ctx.path, info.message);
            }
        }
        else {
            logger.error(ctx.method, ctx.path, err);
        }
    }
}).start(PORT, {
    callback: () => {
        logger.info('Server started');
    }
}).catch(err => logger.error(err));
//# sourceMappingURL=main.js.map