import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  LinearProgress,
  Avatar,
  Fab,
  Dialog,
} from '@mui/material'
import {
  Add as AddIcon,
  Flight as FlightIcon,
  LocationOn as LocationIcon,
  Event as EventIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Map as MapIcon,
  Edit as EditIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material'
import { useTravelStore } from '../../../store/travelStore'
import { TripStatus, TripPurpose } from '../../../types/travel'
import TripPlanner from './TripPlanner'
import { formatDistanceToNow } from 'date-fns'

export const TravelDashboard: React.FC = () => {
  const [plannerOpen, setPlannerOpen] = useState(false)
  const [editingTripId, setEditingTripId] = useState<string | undefined>()

  const {
    trips,
    upcomingTrips,
    activeTrips,
    insights,
    fetchTrips,
    fetchUpcomingTrips,
    fetchActiveTrips,
    fetchInsights,
    updateTripStatus,
  } = useTravelStore()

  useEffect(() => {
    fetchTrips()
    fetchUpcomingTrips()
    fetchActiveTrips()
    fetchInsights()
  }, [fetchTrips, fetchUpcomingTrips, fetchActiveTrips, fetchInsights])

  const getStatusColor = (status: TripStatus) => {
    switch (status) {
      case TripStatus.PLANNING:
        return 'warning'
      case TripStatus.CONFIRMED:
        return 'info'
      case TripStatus.IN_PROGRESS:
        return 'success'
      case TripStatus.COMPLETED:
        return 'default'
      case TripStatus.CANCELLED:
        return 'error'
      default:
        return 'default'
    }
  }

  const getPurposeIcon = (purpose: TripPurpose) => {
    switch (purpose) {
      case TripPurpose.BUSINESS:
      case TripPurpose.CLIENT_VISIT:
        return '💼'
      case TripPurpose.CONFERENCE:
      case TripPurpose.TRAINING:
        return '🎓'
      case TripPurpose.PERSONAL:
      case TripPurpose.VACATION:
        return '🏖️'
      case TripPurpose.FAMILY:
        return '👨‍👩‍👧‍👦'
      default:
        return '✈️'
    }
  }

  const calculateProgress = (trip: any) => {
    if (!trip.checklist || trip.checklist.length === 0) return 0
    const completed = trip.checklist.filter(
      (item: any) => item.completed
    ).length
    return (completed / trip.checklist.length) * 100
  }

  const renderUpcomingTripsWidget = () => (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <EventIcon color="primary" />
            Upcoming Trips
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Next {upcomingTrips.length} trips
          </Typography>
        </Box>

        {upcomingTrips.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <FlightIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No upcoming trips planned
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              sx={{ mt: 2 }}
              onClick={() => setPlannerOpen(true)}
            >
              Plan a Trip
            </Button>
          </Box>
        ) : (
          <List>
            {upcomingTrips.map(trip => (
              <ListItem key={trip.id} divider sx={{ px: 0 }}>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                  {getPurposeIcon(trip.purpose)}
                </Avatar>
                <ListItemText
                  primary={trip.title}
                  secondary={
                    <Box>
                      <Typography variant="caption" display="block">
                        {trip.destinations.map(d => d.city).join(', ')} •{' '}
                        {formatDistanceToNow(trip.startDate, {
                          addSuffix: true,
                        })}
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mt: 1,
                        }}
                      >
                        <Chip
                          label={trip.status}
                          size="small"
                          color={getStatusColor(trip.status) as any}
                          variant="outlined"
                        />
                        <LinearProgress
                          variant="determinate"
                          value={calculateProgress(trip)}
                          sx={{ flexGrow: 1, height: 4, borderRadius: 2 }}
                        />
                        <Typography variant="caption">
                          {Math.round(calculateProgress(trip))}%
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setEditingTripId(trip.id)
                      setPlannerOpen(true)
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  )

  const renderCurrentTravelStatus = () => (
    <Card>
      <CardContent>
        <Typography
          variant="h6"
          sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
        >
          <LocationIcon color="success" />
          Current Travel
        </Typography>

        {activeTrips.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <ScheduleIcon
              sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              No active trips at the moment
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              You're currently not traveling
            </Typography>
          </Box>
        ) : (
          <Box>
            {activeTrips.map(trip => (
              <Card key={trip.id} variant="outlined" sx={{ mb: 2 }}>
                <CardContent sx={{ pb: '16px !important' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {trip.title}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      mb: 1,
                    }}
                  >
                    <LocationIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      Currently in:{' '}
                      {trip.currentLocation || trip.destinations[0]?.city}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <EventIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      Until: {trip.endDate.toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ mt: 2 }}
                    onClick={() => {
                      setEditingTripId(trip.id)
                      setPlannerOpen(true)
                    }}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  )

  const renderTravelStatistics = () => (
    <Card>
      <CardContent>
        <Typography
          variant="h6"
          sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}
        >
          <TrendingUpIcon color="primary" />
          Travel Statistics
        </Typography>

        {insights ? (
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary.main">
                  {insights.totalTrips}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Trips
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {insights.totalDays}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Days Traveled
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {insights.favoriteDestinations.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Destinations
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  ${insights.totalSpent.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Spent
                </Typography>
              </Box>
            </Grid>

            {insights.favoriteDestinations.length > 0 && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                    Top Destinations
                  </Typography>
                </Grid>
                {insights.favoriteDestinations
                  .slice(0, 3)
                  .map((dest, index) => (
                    <Grid item xs={12} key={`${dest.city}-${dest.country}`}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="body2">
                          {index + 1}. {dest.city}, {dest.country}
                        </Typography>
                        <Chip
                          label={`${dest.visitCount} visits`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Grid>
                  ))}
              </>
            )}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Loading travel statistics...
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )

  const renderQuickActions = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setPlannerOpen(true)}
              sx={{ mb: 1 }}
            >
              Plan New Trip
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<CheckIcon />}
              size="small"
            >
              Checklists
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<MoneyIcon />}
              size="small"
            >
              Expenses
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<MapIcon />}
              size="small"
            >
              Map View
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<TrendingUpIcon />}
              size="small"
            >
              Analytics
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )

  const renderRecentActivity = () => {
    const recentTrips = trips
      .filter(trip => trip.status === TripStatus.COMPLETED)
      .sort((a, b) => b.endDate.getTime() - a.endDate.getTime())
      .slice(0, 5)

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Travel Activity
          </Typography>

          {recentTrips.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="body2" color="text.secondary">
                No recent travel activity
              </Typography>
            </Box>
          ) : (
            <List dense>
              {recentTrips.map(trip => (
                <ListItem key={trip.id} sx={{ px: 0 }}>
                  <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                    {getPurposeIcon(trip.purpose)}
                  </Avatar>
                  <ListItemText
                    primary={trip.title}
                    secondary={`${trip.destinations.map(d => d.city).join(', ')} • ${formatDistanceToNow(trip.endDate, { addSuffix: true })}`}
                  />
                  <Chip
                    label="Completed"
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Travel Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setPlannerOpen(true)}
        >
          Plan New Trip
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* First Row - Main Widgets */}
        <Grid item xs={12} md={8}>
          {renderUpcomingTripsWidget()}
        </Grid>
        <Grid item xs={12} md={4}>
          {renderCurrentTravelStatus()}
        </Grid>

        {/* Second Row - Statistics and Actions */}
        <Grid item xs={12} md={6}>
          {renderTravelStatistics()}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderQuickActions()}
        </Grid>

        {/* Third Row - Recent Activity */}
        <Grid item xs={12}>
          {renderRecentActivity()}
        </Grid>
      </Grid>

      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        aria-label="add trip"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', md: 'none' },
        }}
        onClick={() => setPlannerOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* Trip Planner Dialog */}
      <TripPlanner
        open={plannerOpen}
        onClose={() => {
          setPlannerOpen(false)
          setEditingTripId(undefined)
        }}
        tripId={editingTripId}
      />
    </Box>
  )
}

export default TravelDashboard
