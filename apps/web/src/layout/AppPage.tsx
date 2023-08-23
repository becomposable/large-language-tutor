'use client'

import {
    Box,
    Drawer,
    DrawerContent,
    useDisclosure
} from '@chakra-ui/react';
import MobileNav from './MobileNav';
import SidebarContent from './SideBarContent';



interface AppPageProps {
    children: React.ReactNode | React.ReactNode[];
}
export default function AppPage({ children }: AppPageProps) {
    const { isOpen, onOpen, onClose } = useDisclosure()

    return (
        <Box h='100%'>
            <SidebarContent onClose={() => onClose} display={{ base: 'none', md: 'block' }} />
            <Drawer
                isOpen={isOpen}
                placement="left"
                onClose={onClose}
                returnFocusOnClose={false}
                onOverlayClick={onClose}
                size="full">
                <DrawerContent>
                    <SidebarContent onClose={onClose} />
                </DrawerContent>
            </Drawer>
            {/* mobilenav */}
            <MobileNav onOpen={onOpen} />
            <Box ml={{ base: 0, md: 60 }} p="4" h='100%'>
                {children}
            </Box>
        </Box>
    )
}

