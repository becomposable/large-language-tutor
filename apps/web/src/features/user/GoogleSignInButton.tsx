import { Button, Icon } from "@chakra-ui/react";
import { signInWithRedirect, GoogleAuthProvider } from "firebase/auth";
import { firebaseAuth } from "../../auth/firebase";
import { FcGoogle } from "react-icons/fc";

interface GoogleSignInButtonProps {
    redirectTo?: string;
}
export default function GoogleSignInButton({ redirectTo }: GoogleSignInButtonProps) {

    const signIn = () => {
        let redirectPath = redirectTo || window.location.pathname || '/';
        if (redirectPath[0] !== '/') {
            redirectPath = '/' + redirectPath;
        }
        const provider = new GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        // always ask to select the google account        
        provider.setCustomParameters({
            prompt: 'select_account',
            redirect_uri: window.location.origin + redirectPath
        });
        signInWithRedirect(firebaseAuth, provider);
    }

    return (
        <Button borderRadius="2px" onClick={signIn} w="100%" variant="outline" leftIcon={<Icon as={FcGoogle} boxSize="5" />} iconSpacing="3">
            Sign in with Google
        </Button>
    )
}

