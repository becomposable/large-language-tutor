
import mongoose from 'mongoose';
import logger from './logger.js';
import Env from './env.js';


class Database {
    mongoose?: mongoose.Mongoose;

    async start() {
        logger.info(`Starting Mongoose}`);
        this.mongoose = await mongoose.connect(Env.db.url!, {
            user: Env.db.username,
            pass: Env.db.password
        });
        logger.info(`Connected to: ${Env.db.url}`);

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
