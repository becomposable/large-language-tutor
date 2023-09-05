import { Avatar, Box, Flex, HStack, Menu, MenuButton, MenuDivider, MenuItem, MenuList, Spinner, Text, VStack, useDisclosure } from "@chakra-ui/react";
import { useUserSession } from "../../context/UserSession"
import { FiChevronDown } from "react-icons/fi";
import SignInModal from "./SignInModal";
import { useAppBgColorModeValue, useAppBorderColorModeValue } from "../../layout/colors";
import UserPrefModal from "./UserSettingsModal";


interface UserMenuProps {
}
export default function UserMenu({ }: UserMenuProps) {
    const { user, signOut, isLoading } = useUserSession();
    const appBg = useAppBgColorModeValue();
    const appBorderColor = useAppBorderColorModeValue();

    if (isLoading) {
        return <Spinner />
    } else if (!user) {
        return <SignInModal />
    } else {
        return (
            <Menu>
                <MenuButton py={2} transition="all 0.3s" _focus={{ boxShadow: 'none' }}>
                    <HStack>
                        <Avatar
                            size={'sm'}
                            src={user.picture || undefined}
                            name={user.name}
                        />
                        <VStack
                            display={{ base: 'none', md: 'flex' }}
                            alignItems="flex-start"
                            spacing="1px"
                            ml="2">
                            <Text fontSize="sm">{user.name}</Text>
                            {/*
                        <Text fontSize="xs" color="gray.600">
                            Admin
                         </Text>
                        */}
                        </VStack>
                        <Box display={{ base: 'none', md: 'flex' }}>
                            <FiChevronDown />
                        </Box>
                    </HStack>
                </MenuButton>
                <MenuList
                    bg={appBg}
                    borderColor={appBorderColor}>
                    <MenuItem>Profile</MenuItem>
                    <UserMenuSettings />
                    <MenuItem>Billing</MenuItem>
                    <MenuDivider />
                    <MenuItem onClick={signOut}>Sign out</MenuItem>
                </MenuList>
            </Menu>
        )
    }
}


interface UserSettingsModalProps {
}
function UserMenuSettings({ }: UserSettingsModalProps) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    return (
        <>
            <MenuItem onClick={onOpen}>Settings</MenuItem>
            <UserPrefModal isOpen={isOpen} onClose={onClose} />
        </>
    )
}

