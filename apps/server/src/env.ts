
import dotenv from 'dotenv';

dotenv.config();

const env: Record<string, any> = {
    version: process.env.VERSION || "1.0.0",
    port: process.env.PORT || 8089,
    name: process.env.NAME || "Language Tutor",
    openai: process.env.OPENAI_API_KEY,
    db: {
        url: process.env.DB_URL,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
    }
}

export default env;