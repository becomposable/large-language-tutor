import { Box, ChakraProvider } from '@chakra-ui/react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { UserSessionProvider } from './context/UserSession'
import { getKuromojiTokenizer } from './hooks/kurojomi'
import useOnWindowLoad from './hooks/useOnWindowLoad'
import ConversationPage from './pages/ConversationPage'
import ConversationsPage from './pages/ConversationsPage'
import DashboardPage from './pages/DashboardPage'
import StoriesPage from './pages/StoriesPage'
import StoryPage from './pages/StoryPage'
import ExplainPage from './pages/ExplainPage'
import { Analytics } from '@vercel/analytics/react'


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
    },
    {
        path: '/explain',
        Component: ExplainPage,
    }
]);

function App() {
    useOnWindowLoad(() => {
        // force kuromoji dictionaires to load on window load
    getKuromojiTokenizer();
    });

    return (
        <UserSessionProvider>
            <ChakraProvider>
                <Box px='2rem' h='100%'>
                    <RouterProvider router={router} />∏
                </Box>
            </ChakraProvider>
            <Analytics />
        </UserSessionProvider>
    )

}

export default App
