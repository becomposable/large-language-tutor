
import dotenv from 'dotenv';

dotenv.config();

export const env: Record<string, string | number | boolean | undefined> = {
    version: process.env.VERSION || "1.0.0",
    port: process.env.PORT || 8089,
    name: process.env.NAME || "Language Tutor",
}
