import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material'
import { useTravelStore } from '../../../store/travelStore'
import TravelTasks from './TravelTasks'
import type { Trip } from '../../../types/travel'

const TravelTasksPage: React.FC = () => {
  const [selectedTripId, setSelectedTripId] = useState<string>('')
  const [loading, setLoading] = useState(true)

  const { trips, fetchTrips, upcomingTrips, fetchUpcomingTrips } =
    useTravelStore()

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        await Promise.all([fetchTrips(), fetchUpcomingTrips()])
      } catch (error) {
        console.error('Error loading travel data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [fetchTrips, fetchUpcomingTrips])

  // Auto-select the first upcoming trip if no trip is selected
  useEffect(() => {
    if (!selectedTripId && upcomingTrips.length > 0) {
      setSelectedTripId(upcomingTrips[0].id)
    }
  }, [selectedTripId, upcomingTrips])

  const selectedTrip = trips.find(trip => trip.id === selectedTripId)

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    )
  }

  if (trips.length === 0) {
    return (
      <Alert severity="info">
        No trips found. Create a trip first to manage travel tasks.
      </Alert>
    )
  }

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Travel Task Management
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Manage tasks related to your travels including pre-travel
            preparation, location-specific tasks, and post-travel follow-ups.
          </Typography>

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="trip-select-label">Select Trip</InputLabel>
            <Select
              labelId="trip-select-label"
              value={selectedTripId}
              label="Select Trip"
              onChange={e => setSelectedTripId(e.target.value)}
            >
              {trips.map(trip => (
                <MenuItem key={trip.id} value={trip.id}>
                  <Box>
                    <Typography variant="body1">{trip.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(trip.startDate).toLocaleDateString()} -{' '}
                      {new Date(trip.endDate).toLocaleDateString()}
                      {' • '}
                      {trip.destinations
                        .map(d => `${d.city}, ${d.country}`)
                        .join('; ')}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {selectedTrip ? (
        <TravelTasks
          trip={selectedTrip}
          onTaskUpdate={() => {
            // Optionally refresh data when tasks are updated
            fetchTrips()
          }}
        />
      ) : (
        <Alert severity="warning">
          Please select a trip to view and manage travel tasks.
        </Alert>
      )}
    </Box>
  )
}

export default TravelTasksPage
