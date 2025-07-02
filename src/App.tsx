import React from 'react'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { ThemeProvider } from './components/layout/ThemeProvider'
import { AppRouter } from './components/layout/AppRouter'

const App: React.FC = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <ThemeProvider>
        <AppRouter />
      </ThemeProvider>
    </LocalizationProvider>
  )
}

export default App
