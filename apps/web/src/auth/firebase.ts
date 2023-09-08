import { FirebaseOptions, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import Env from '../env';

//use same host if we're not in local dev to avoid Safari auth issues
const authDomain = Env.HOST_DOMAIN.startsWith('localhost') ? "language-labs-397109.firebaseapp.com" : Env.HOST_DOMAIN;

export const firebaseConfig: FirebaseOptions = {
    apiKey: "AIzaSyCfU437XoWFhUu98QleE7UoSlP9JtcWxeE",
    authDomain: authDomain,
};

const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);

function getAuthToken(refresh?: boolean) {
    const user = firebaseAuth.currentUser;
    if (user) {
        return user.getIdToken(refresh).then(token => {
            return {
                scheme: 'Bearer',
                token: token
            }
        }).catch((err) => {
            console.error('Failed to get access token', err);
            return null;
        });
    } else {
        return Promise.resolve(null);
    }
}

export { firebaseApp, firebaseAuth, getAuthToken };

