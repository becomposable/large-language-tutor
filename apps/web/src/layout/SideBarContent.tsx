import { Box, BoxProps, CloseButton, Flex, FlexProps, Icon, Text } from "@chakra-ui/react"
import { SyntheticEvent } from "react"
import { IconType } from "react-icons"
import { BsBodyText, BsChatText } from "react-icons/bs"
import { FiHome, FiSettings } from "react-icons/fi"
import { useNavigate } from "react-router"
import CreateConversationModal from "../features/conversations/CreateConversationModal"
import { useAppBgColorModeValue, useAppBorderColorModeValue } from "./colors"

interface LinkItemProps {
    name: string
    icon: IconType
    href: string
    action?: React.ReactNode
}

const LinkItems: Array<LinkItemProps> = [
    { name: 'Home', icon: FiHome, href: '/' },
    {
        name: 'Conversations', icon: BsChatText, href: '/conversations',
        action: <CreateConversationModal />
    },
    {
        name: 'Stories', icon: BsBodyText, href: '/stories',
        action: <CreateConversationModal />
    },
    {
        name: 'Settings', icon: FiSettings, href: '/settings'
    },
    // { name: 'Favourites', icon: FiStar },
    // { name: 'Settings', icon: FiSettings },
]


interface NavItemProps extends FlexProps {
    item: LinkItemProps
    children: React.ReactNode
}


interface SidebarProps extends BoxProps {
    onClose: () => void
}

export default function SidebarContent({ onClose, ...rest }: SidebarProps) {
    return (
        <Box
            transition="3s ease"
            bg={useAppBgColorModeValue()}
            borderRight="1px"
            borderRightColor={useAppBorderColorModeValue()}
            w={{ base: 'full', md: 60 }}
            pos="fixed"
            h="full"
            {...rest}>
            <Flex h="20" alignItems="center" mx="4" justifyContent="space-between">
                <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
                    Lang Tutor
                </Text>
                <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
            </Flex>
            {LinkItems.map((link) => (
                <NavItem key={link.name} item={link}>
                    {link.name}
                </NavItem>
            ))}
        </Box>
    )
}

const NavItem = ({ item, children, ...rest }: NavItemProps) => {
    const navigate = useNavigate();
    const { icon, href, action } = item;

    const onClick = (e: SyntheticEvent) => {
        e.preventDefault();
        navigate(href);
    }

    return (
        <Box
            as="a"
            href={href}
            onClick={onClick}
            style={{ textDecoration: 'none' }}
            _focus={{ boxShadow: 'none' }}>
            <Flex
                w='100%'
                align="center"
                p="4"
                borderRadius="lg"
                role="group"
                cursor="pointer"
                _hover={{
                    bg: 'cyan.400',
                    color: 'white',
                }}
                {...rest}>
                {icon && (
                    <Icon
                        mr="4"
                        fontSize="16"
                        _groupHover={{
                            color: 'white',
                        }}
                        as={icon}
                    />
                )}
                {children}
                {action && <Box ml='auto'>{action}</Box>}
            </Flex>
        </Box>
    )
}

