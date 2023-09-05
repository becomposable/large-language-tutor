/**
 * Modal display if the user doesn't have a language set
 */

import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from "@chakra-ui/react";
import { User } from "@language-tutor/types";
import { useState } from "react";
import LanguageSelector from "../../components/LanguageSelector";
import { useUserSession } from "../../context/UserSession";

interface UserPrefModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UserPrefModal({ isOpen, onClose }: UserPrefModalProps) {

    const { user, client } = useUserSession();
    const [ userPref, setUserPref ] = useState<Partial<User>|undefined>(undefined);

    const updateUserPref = (key: string, value: string) => {
        setUserPref({...userPref, [key]: value});
    }

    const savePrefs = () => {
        if (userPref) {
            console.log("Saving user prefs: ", userPref)
            client.post('/users/me', { payload: userPref } )
                .then(() => {
                    onClose();
                })
                .catch(err => {
                    console.error(err);
                })
        }
    }


    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Set your language</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <LanguageSelector
                        value={user?.language ?? 'en'}
                        onChange={ (value) => updateUserPref('language', value)}
                        />
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme='blue' mr={3} onClick={onClose}>Close</Button>
                    <Button colorScheme='green' mr={3} onClick={savePrefs}>Save</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>

    )

}