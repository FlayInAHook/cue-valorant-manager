import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Box, Center, ChakraProvider } from '@chakra-ui/react'
import { Provider } from 'jotai'
import MainView from './MainView'

function App() {

  return (
    <>
      <Provider>
        <ChakraProvider>
          <Center>
            <Box height={"100vh"} textAlign={"center"} width={"95vw"}>
              <MainView/>
            </Box>
          </Center>
          
        </ChakraProvider>
      </Provider>
    </>
  )
}

export default App
