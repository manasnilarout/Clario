import React from 'react'
import { ThemeProvider } from './components/layout/ThemeProvider'
import { AppRouter } from './components/layout/AppRouter'

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppRouter />
    </ThemeProvider>
  )
}

export default App
