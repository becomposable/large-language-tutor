import firebase from 'firebase-admin';
import { DecodedIdToken } from 'firebase-admin/auth';
import { AuthError, AuthModule, AuthModuleOptions, Principal } from './module.js';

function verifyIdToken(token: string, checkRevoked?: boolean | undefined) {
    return firebase.auth().verifyIdToken(token, checkRevoked);
}


export class FirebasePrincipal<UserDocumentT> extends Principal<UserDocumentT> {

    constructor(module: FirebaseAuth<UserDocumentT>, public token: DecodedIdToken) {
        super(module, token.uid);
    }

    get email() {
        return this.token.email;
    }

}

export class FirebaseAuth<UserDocumentT> extends AuthModule<FirebasePrincipal<UserDocumentT>, UserDocumentT> {

    logError = (err: any) => console.error('Firebase auth failed', err);

    constructor(opts: AuthModuleOptions<FirebasePrincipal<UserDocumentT>>) {
        super('firebase', opts)
    }

    withErrorLogger(logError: (err: any) => void) {
        this.logError = logError;
        return this;
    }

    async authorize(authScheme: string, authToken: string): Promise<FirebasePrincipal<UserDocumentT> | undefined> {
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


