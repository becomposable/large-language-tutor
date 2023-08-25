import { Box, ChakraProvider } from '@chakra-ui/react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { UserSessionProvider } from './context/UserSession'
import ConversationPage from './pages/ConversationPage'
import ConversationsPage from './pages/ConversationsPage'
import DashboardPage from './pages/DashboardPage'
import StoriesPage from './pages/StoriesPage'
import StoryPage from './pages/StoryPage'
import useOnWindowLoad from './hooks/useOnWindowLoad'
import { getKuromojiTokizer } from './hooks/kurojomi'


const router = createBrowserRouter([
    {
        path: '/',
        Component: DashboardPage,
    },
    {
        path: '/conversations/:conversationId',
        Component: ConversationPage,
    },
    {
        path: '/conversations',
        Component: ConversationsPage,
    },
    {
        path: '/stories',
        Component: StoriesPage,
    },
    {
        path: '/stories/:storyId',
        Component: StoryPage,
    }
]);

function App() {
    useOnWindowLoad(() => {
        // force kuromoji dictionaires to load on window load
        getKuromojiTokizer();
    });

    return (
        <UserSessionProvider>
            <ChakraProvider>
                <Box px='2rem' h='100%'>
                    <RouterProvider router={router} />∏
                </Box>
            </ChakraProvider>
        </UserSessionProvider>
    )

}

export default App
