import { Avatar, Box, Flex, FlexProps, HStack, IconButton, Menu, MenuButton, MenuDivider, MenuItem, MenuList, Text, VStack } from "@chakra-ui/react"
import {
    FiBell,
    FiChevronDown,
    FiMenu,
} from 'react-icons/fi'
import { useAppBgColorModeValue, useAppBorderColorModeValue } from "./colors"
import { useUserSession } from "../context/UserSession";
import SignInModal from "../features/user/SignInModal";


interface MobileNavProps extends FlexProps {
    onOpen: () => void
}
export default function MobileNav({ onOpen, ...rest }: MobileNavProps) {
    const { user, signOut } = useUserSession();
    const appBg = useAppBgColorModeValue();
    const appBorderColor = useAppBorderColorModeValue();

    return (
        <Flex
            ml={{ base: 0, md: 60 }}
            px={{ base: 4, md: 4 }}
            height="20"
            alignItems="center"
            bg={appBg}
            borderBottomColor={appBorderColor}
            borderBottomWidth="1px"
            justifyContent={{ base: 'space-between', md: 'flex-end' }}
            {...rest}>
            <IconButton
                display={{ base: 'flex', md: 'none' }}
                onClick={onOpen}
                variant="outline"
                aria-label="open menu"
                icon={<FiMenu />}
            />

            <Text
                display={{ base: 'flex', md: 'none' }}
                fontSize="2xl"
                fontFamily="monospace"
                fontWeight="bold">
                Language Tutor
            </Text>

            <HStack spacing={{ base: '0', md: '6' }}>
                <IconButton size="lg" variant="ghost" aria-label="open menu" icon={<FiBell />} />
                <Flex alignItems={'center'}>
                    {user ? (
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
                                <MenuItem>Settings</MenuItem>
                                <MenuItem>Billing</MenuItem>
                                <MenuDivider />
                                <MenuItem onClick={signOut}>Sign out</MenuItem>
                            </MenuList>
                        </Menu>
                    ) : <SignInModal />}
                </Flex>
            </HStack>
        </Flex>
    )
}
