import { Avatar, Box, Flex, FlexProps, HStack, IconButton, Menu, MenuButton, MenuDivider, MenuItem, MenuList, Text, VStack } from "@chakra-ui/react"
import {
    FiBell,
    FiChevronDown,
    FiMenu,
} from 'react-icons/fi'
import { useAppBgColorModeValue, useAppBorderColorModeValue } from "./colors"
import { useUserSession } from "../context/UserSession";
import SignInModal from "../features/user/SignInModal";
import UserMenu from "../features/user/UserMenu";


interface MobileNavProps extends FlexProps {
    onOpen: () => void
}
export default function MobileNav({ onOpen, ...rest }: MobileNavProps) {
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
                <UserMenu />
            </HStack>
        </Flex>
    )
}
