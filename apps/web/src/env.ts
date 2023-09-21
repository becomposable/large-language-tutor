
const env = import.meta.env;

const serverUrl = env.VITE_SERVER_URL || "https://lang-tutor-jc6rsiqkva-uc.a.run.app";

console.log(env);

const Env = {
    isProd: !!env.PROD,
    isDev: !!env.DEV,
    mode: env.MODE,
    ACCOUNT_HEADER: env.VITE_ACCOUNT_HEADER || "x-account-id",
    BASE_URL: env.BASE_URL,
    SERVER_URL: serverUrl,
    API_BASE_URL: `${serverUrl}/api/v1`,
    AUTH_BASE_URL: `${serverUrl}/auth`,
    WEB_DOMAIN: env.VITE_WEB_DOMAIN,
    KUROMOJI_DICT: env.VITE_KUROMOJI_DICT || "/kuromoji/dict/",
}


console.log('App Env', Env);

export default Env;
