
import dotenv from 'dotenv';

dotenv.config();

const serverUrl = process.env.SERVER_URL || "http://localhost:8089";

const Env = {
    xAccountHeader: process.env.X_ACCOUNT_HEADER || 'x-account-id',
    isDev: process.env.NODE_ENV === 'development',
    isProd: process.env.NODE_ENV === 'production',
    version: process.env.VERSION || "1.0.0",
    port: process.env.PORT || 8089,
    name: process.env.NAME || "Language Tutor",
    serverUrl,
    openai: process.env.OPENAI_API_KEY,
    google: {
        projectId: process.env.GOOGLE_PROJECT_ID || "language-labs-397109",
    },
    db: {
        url: process.env.DB_URL,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
    }
}

export default Env;