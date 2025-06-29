import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Container,
  Tab,
  Tabs,
  Card,
  CardContent,
  Button,
  Fab,
  useTheme,
} from '@mui/material'
import {
  Add as AddIcon,
  CalendarMonth as CalendarIcon,
  List as ListIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material'
import {
  Calendar,
  MeetingsList,
  MeetingForm,
  MeetingDashboard,
} from '../components/features/meetings'
import { Meeting } from '../types/meeting'
import { useMeetingsStore } from '../store/meetingsStore'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  index,
  ...other
}) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`meetings-tabpanel-${index}`}
      aria-labelledby={`meetings-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  )
}

const Meetings: React.FC = () => {
  const theme = useTheme()
  const {
    loadMeetings,
    loadStats,
    loadActionItems,
    stats,
    setCreating,
    refreshMeetings,
    error,
  } = useMeetingsStore()

  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([loadMeetings(), loadStats(), loadActionItems()])
      } catch (error) {
        console.error('Failed to initialize meetings data:', error)
      }
    }

    initializeData()
  }, [loadMeetings, loadStats, loadActionItems])

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const handleCreateMeeting = (date?: Date) => {
    setCreating(true)
    // The MeetingForm component will handle the actual form display
    if (date) {
      // If a specific date is provided, we could set it in the store or pass it to the form
      console.log('Create meeting for date:', date)
    }
  }

  const handleMeetingClick = (meeting: Meeting) => {
    console.log('Meeting clicked:', meeting)
    // This would typically open a meeting detail view or edit form
  }

  const handleDateClick = (date: Date) => {
    console.log('Date clicked:', date)
    // This could switch to day view or create a new meeting for that date
  }

  const renderQuickStats = () => {
    if (!stats) return null

    return (
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Card sx={{ flex: 1, minWidth: 200 }}>
            <CardContent>
              <Typography variant="h4" color="primary">
                {stats.upcomingMeetings}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upcoming Meetings
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ flex: 1, minWidth: 200 }}>
            <CardContent>
              <Typography variant="h4" color="success.main">
                {stats.completedMeetings}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed This Month
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ flex: 1, minWidth: 200 }}>
            <CardContent>
              <Typography variant="h4" color="warning.main">
                {stats.overdueActionItems}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Overdue Action Items
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ flex: 1, minWidth: 200 }}>
            <CardContent>
              <Typography variant="h4" color="info.main">
                {Math.round(stats.averageDuration)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Meeting (min)
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    )
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" color="error" gutterBottom>
            Error Loading Meetings
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {error}
          </Typography>
          <Button variant="contained" onClick={refreshMeetings}>
            Retry
          </Button>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Meetings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your meetings, calendar, and action items
        </Typography>
      </Box>

      {/* Quick Stats */}
      {renderQuickStats()}

      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              minWidth: 120,
              fontSize: '1rem',
              fontWeight: 500,
            },
          }}
        >
          <Tab label="Calendar" icon={<CalendarIcon />} iconPosition="start" />
          <Tab label="List View" icon={<ListIcon />} iconPosition="start" />
          <Tab
            label="Analytics"
            icon={<AnalyticsIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <TabPanel value={activeTab} index={0}>
        <Calendar
          onMeetingClick={handleMeetingClick}
          onDateClick={handleDateClick}
          onCreateMeeting={handleCreateMeeting}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <MeetingsList
          onMeetingClick={handleMeetingClick}
          onCreateMeeting={handleCreateMeeting}
          showFilters={true}
          showSearch={true}
          showPagination={true}
          itemsPerPage={12}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <MeetingDashboard
          onMeetingClick={handleMeetingClick}
          onCreateMeeting={handleCreateMeeting}
          showActionItems={true}
          showTeamAvailability={true}
        />
      </TabPanel>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add meeting"
        onClick={() => handleCreateMeeting()}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: theme.zIndex.fab,
        }}
      >
        <AddIcon />
      </Fab>

      {/* Meeting Form Modal */}
      <MeetingForm />
    </Container>
  )
}

export default Meetings
