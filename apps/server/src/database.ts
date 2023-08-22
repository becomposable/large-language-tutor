
import mongoose from 'mongoose';
import logger from './logger.js';
import env from './env.js';


class Database {
    mongoose?: mongoose.Mongoose;

    async start() {
        logger.info(`Starting Mongoose}`);
        this.mongoose = await mongoose.connect(env.db.url, {
            user: env.db.username,
            pass: env.db.password
        });
        logger.info(`Connected to: ${env.db.url}`);

        this.mongoose.set('strict', false);
        this.mongoose.set('strictQuery', false);

        return this.mongoose;
    }

    async stop() {
        if (this.mongoose) {
            await this.mongoose.disconnect();
            this.mongoose = undefined;
        }
    }
}

export default Database;
