import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CircularProgress, Box } from '@mui/material'
import { AppShell } from './AppShell'

// Import pages
import Dashboard from '../../pages/Dashboard'
import Travel from '../../pages/Travel'
import Contacts from '../../pages/Contacts'
import Meetings from '../../pages/Meetings'
import Tasks from '../../pages/Tasks'
import Insights from '../../pages/Insights'
import OGSM from '../../pages/OGSM'
import Settings from '../../pages/Settings'

const LoadingSpinner: React.FC = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="200px"
  >
    <CircularProgress />
  </Box>
)

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <AppShell>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/travel" element={<Travel />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/meetings" element={<Meetings />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/ogsm" element={<OGSM />} />
            <Route path="/settings" element={<Settings />} />
            {/* Catch all route - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AppShell>
    </BrowserRouter>
  )
}
