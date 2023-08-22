import { Box, ChakraProvider } from '@chakra-ui/react'
import './App.css'
import TutorChat from './features/chat/TutorChat'

function App() {

    return (
        <ChakraProvider>
            <Box>
                <TutorChat />
            </Box>
        </ChakraProvider>
    )

}

export default App
