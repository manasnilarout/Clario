import React, { useState } from 'react'
import { Box, Tabs, Tab, Container } from '@mui/material'
import {
  TravelDashboard,
  TripPlanner,
  TravelChecklist,
  TravelTasksPage,
} from '../components/features/travel'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`travel-tabpanel-${index}`}
      aria-labelledby={`travel-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

const Travel: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0)

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="travel management tabs"
          >
            <Tab
              label="Dashboard"
              id="travel-tab-0"
              aria-controls="travel-tabpanel-0"
            />
            <Tab
              label="Checklist"
              id="travel-tab-2"
              aria-controls="travel-tabpanel-2"
            />
            <Tab
              label="Tasks"
              id="travel-tab-3"
              aria-controls="travel-tabpanel-3"
            />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <TravelDashboard />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <TripPlanner open={true} onClose={() => {}} />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <TravelChecklist tripId="" />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <TravelTasksPage />
        </TabPanel>
      </Box>
    </Container>
  )
}

export default Travel
