import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure } from "@chakra-ui/react"
import { firebaseAuth } from "../../auth/firebase"
import { GoogleAuthProvider, browserPopupRedirectResolver, signInWithPopup, signInWithRedirect, UserCredential } from "firebase/auth";
import GoogleSignInButton from "./GoogleSignInButton";



interface SignInModalProps {
}
export default function SignInModal({ }: SignInModalProps) {
    const { isOpen, onOpen, onClose } = useDisclosure()


    return (
        <>
            <Button onClick={onOpen}>Sign in</Button>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Sign in</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody display='flex' alignItems='center' justifyContent='center' h='100%'>

                        <GoogleSignInButton />

                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='blue' mr={3} onClick={onClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}