import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Box } from '@radix-ui/themes'
import TutorChat from './features/chat/TutorChat'

function App() {

    return (
        <Box className='app-container'>
            <TutorChat />
        </Box>
    )

}

export default App
