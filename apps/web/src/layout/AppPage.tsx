'use client'

import {
    Box,
    Center,
    Drawer,
    DrawerContent,
    Spinner,
    useDisclosure
} from '@chakra-ui/react';
import MobileNav from './MobileNav';
import SidebarContent from './SideBarContent';
import { useUserSession } from '../context/UserSession';
import AnonymousPage from './AnonymousPage';
import React from 'react';
import { ExplainContextProvider } from '../features/chat/ExplainContextProvider';



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
                <PageContent>{children}</PageContent>
            </Box>
        </Box>
    )
}

interface PageContentProps {
    children: React.ReactNode | React.ReactNode[];
}
function PageContent({ children }: PageContentProps) {
    const { user, isLoading } = useUserSession();
    if (isLoading) {
        return <Center mt='20'><Spinner /></Center>;
    }
    if (user) {
        return (
            <ExplainContextProvider>
                {children}
            </ExplainContextProvider>
        )
    }
    return (
        <AnonymousPage />
    )
}

