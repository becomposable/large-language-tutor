
const env = import.meta.env;

const serverUrl = env.VITE_SERVER_URL || "https://lang-tutor-jc6rsiqkva-uc.a.run.app";

const Env = {
    isProd: !!env.PROD,
    isDev: !!env.DEV,
    mode: env.MODE,
    BASE_URL: env.BASE_URL,
    SERVER_URL: serverUrl,
    API_BASE_URL: `${serverUrl}/api/v1`,
    KUROMOJI_DICT: env.VITE_KUROMOJI_DICT || "/kuromoji/dict/",
}


export default Env;
