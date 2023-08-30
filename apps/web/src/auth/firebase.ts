import { FirebaseOptions, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

export const firebaseConfig: FirebaseOptions = {
    apiKey: "AIzaSyCfU437XoWFhUu98QleE7UoSlP9JtcWxeE",
    authDomain: "language-labs-397109.firebaseapp.com",
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

