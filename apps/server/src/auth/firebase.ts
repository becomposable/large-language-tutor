import firebase from 'firebase-admin';
import { DecodedIdToken } from 'firebase-admin/auth';
import { AuthModule, AuthModuleOptions, IUser, Principal } from './module.js';
import { AuthError } from './error.js';

function verifyIdToken(token: string, checkRevoked?: boolean | undefined) {
    return firebase.auth().verifyIdToken(token, checkRevoked);
}


export class FirebasePrincipal<UserT extends IUser> extends Principal<UserT> {

    constructor(module: FirebaseAuth<UserT>, public token: DecodedIdToken) {
        super(module, token.uid);
    }

    get email() {
        return this.token.email;
    }

}

export class FirebaseAuth<UserT extends IUser> extends AuthModule<FirebasePrincipal<UserT>, UserT> {

    logError = (err: any) => console.error('Firebase auth failed', err);

    constructor(opts: AuthModuleOptions<FirebasePrincipal<UserT>>) {
        super('firebase', opts)
    }

    withErrorLogger(logError: (err: any) => void) {
        this.logError = logError;
        return this;
    }

    async authorize(authScheme: string, authToken: string): Promise<FirebasePrincipal<UserT> | undefined> {
        if (authScheme === 'bearer') {
            try {
                const decodedToken = await verifyIdToken(authToken);
                return new FirebasePrincipal(this, decodedToken);
            } catch (err) {
                this.logError(err);
                throw AuthError.notAuthorized();
            }
        }
    }

}


