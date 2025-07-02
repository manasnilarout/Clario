import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Paper,
  LinearProgress,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import {
  Flight as FlightIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  LocationOn as LocationIcon,
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  Insights as InsightsIcon,
} from '@mui/icons-material'
import { format, formatDistanceToNow } from 'date-fns'
import type { Contact } from '../../../types/contact'
import type {
  TravelHistory,
  TravelPatterns,
} from '../../../services/travelContactIntegration'
import { travelContactIntegration } from '../../../services/travelContactIntegration'

interface TravelHistoryProps {
  contact: Contact
}

interface RelationshipMetrics {
  overallStrength: number
  trendDirection: 'improving' | 'stable' | 'declining'
  lastInteraction: Date
  recommendedActions: string[]
}

const TravelHistoryComponent: React.FC<TravelHistoryProps> = ({ contact }) => {
  const [travelHistory, setTravelHistory] = useState<TravelHistory[]>([])
  const [travelPatterns, setTravelPatterns] = useState<TravelPatterns | null>(
    null
  )
  const [relationshipMetrics, setRelationshipMetrics] =
    useState<RelationshipMetrics | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadTravelData()
  }, [contact.id])

  const loadTravelData = async () => {
    setLoading(true)
    try {
      const [history, patterns] = await Promise.all([
        travelContactIntegration.trackContactTravelHistory(contact.id),
        travelContactIntegration.analyzeContactTravelPatterns(contact.id),
      ])

      setTravelHistory(history)
      setTravelPatterns(patterns)

      // Calculate relationship metrics
      const metrics =
        await travelContactIntegration.analyzeRelationshipStrength(
          contact.id,
          history
        )
      setRelationshipMetrics(metrics)
    } catch (error) {
      console.error('Error loading travel data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'positive':
        return <CheckCircleIcon color="success" />
      case 'negative':
        return <ErrorIcon color="error" />
      default:
        return <WarningIcon color="warning" />
    }
  }

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'positive':
        return 'success'
      case 'negative':
        return 'error'
      default:
        return 'warning'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUpIcon color="success" />
      case 'declining':
        return <TrendingDownIcon color="error" />
      default:
        return <TrendingFlatIcon color="action" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'success'
      case 'declining':
        return 'error'
      default:
        return 'info'
    }
  }

  const getStrengthColor = (strength: number) => {
    if (strength >= 70) return 'success'
    if (strength >= 40) return 'warning'
    return 'error'
  }

  if (loading) {
    return (
      <Box display="flex" alignItems="center" gap={2} p={2}>
        <CircularProgress size={20} />
        <Typography>Loading travel history...</Typography>
      </Box>
    )
  }

  if (travelHistory.length === 0) {
    return (
      <Alert severity="info">
        No travel history found with this contact. Travel history is generated
        when contacts are linked to trips or meetings during travel.
      </Alert>
    )
  }

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <FlightIcon color="primary" />
            <Typography variant="h6">Travel Relationship Analysis</Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            Analysis of business relationship through travel interactions with{' '}
            {contact.firstName} {contact.lastName}.
          </Typography>

          {relationshipMetrics && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography
                    variant="h4"
                    color={getStrengthColor(
                      relationshipMetrics.overallStrength
                    )}
                  >
                    {Math.round(relationshipMetrics.overallStrength)}%
                  </Typography>
                  <Typography variant="caption">
                    Relationship Strength
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={relationshipMetrics.overallStrength}
                    color={
                      getStrengthColor(
                        relationshipMetrics.overallStrength
                      ) as any
                    }
                    sx={{ mt: 1 }}
                  />
                </Paper>
              </Grid>

              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    gap={1}
                  >
                    {getTrendIcon(relationshipMetrics.trendDirection)}
                    <Typography
                      variant="h6"
                      color={getTrendColor(relationshipMetrics.trendDirection)}
                    >
                      {relationshipMetrics.trendDirection}
                    </Typography>
                  </Box>
                  <Typography variant="caption">Trend Direction</Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {travelHistory.length}
                  </Typography>
                  <Typography variant="caption">Travel Interactions</Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary">
                    {formatDistanceToNow(relationshipMetrics.lastInteraction)}{' '}
                    ago
                  </Typography>
                  <Typography variant="caption">Last Interaction</Typography>
                </Paper>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {/* Travel History Timeline */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Travel History Timeline
              </Typography>

              <List>
                {travelHistory.map((history, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <ListItemIcon>
                      {getOutcomeIcon(history.outcome)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body1">
                            {history.destination}
                          </Typography>
                          <Chip
                            label={history.outcome}
                            size="small"
                            color={getOutcomeColor(history.outcome) as any}
                            variant="outlined"
                          />
                          <Chip
                            label={history.purpose}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {format(history.date, 'MMM dd, yyyy')} •{' '}
                            {history.meetingsHeld} meeting
                            {history.meetingsHeld !== 1 ? 's' : ''}
                          </Typography>
                          {history.followUpRequired && (
                            <Chip
                              label="Follow-up required"
                              size="small"
                              color="warning"
                              variant="outlined"
                              sx={{ mt: 0.5 }}
                            />
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Recommended Actions */}
          {relationshipMetrics?.recommendedActions &&
            relationshipMetrics.recommendedActions.length > 0 && (
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recommended Actions
                  </Typography>
                  <List>
                    {relationshipMetrics.recommendedActions.map(
                      (action, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemIcon>
                            <InsightsIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="body2">{action}</Typography>
                            }
                          />
                        </ListItem>
                      )
                    )}
                  </List>
                </CardContent>
              </Card>
            )}
        </Grid>

        <Grid item xs={12} md={4}>
          {/* Travel Patterns */}
          {travelPatterns && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Travel Patterns
                </Typography>

                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">
                      Frequent Destinations
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List dense>
                      {travelPatterns.frequentDestinations
                        .slice(0, 5)
                        .map((dest, index) => (
                          <ListItem key={index} sx={{ px: 0 }}>
                            <ListItemIcon>
                              <LocationIcon color="action" />
                            </ListItemIcon>
                            <ListItemText
                              primary={`${dest.city}, ${dest.country}`}
                              secondary={
                                <Box>
                                  <Typography variant="caption">
                                    {dest.visitCount} visit
                                    {dest.visitCount !== 1 ? 's' : ''} • Avg
                                    stay: {Math.round(dest.averageStayDuration)}{' '}
                                    days
                                  </Typography>
                                  <br />
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Last visit:{' '}
                                    {format(dest.lastVisit, 'MMM yyyy')}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                    </List>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">Seasonal Trends</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List dense>
                      {travelPatterns.seasonalTrends
                        .slice(0, 3)
                        .map((trend, index) => {
                          const monthNames = [
                            'Jan',
                            'Feb',
                            'Mar',
                            'Apr',
                            'May',
                            'Jun',
                            'Jul',
                            'Aug',
                            'Sep',
                            'Oct',
                            'Nov',
                            'Dec',
                          ]
                          return (
                            <ListItem key={index} sx={{ px: 0 }}>
                              <ListItemText
                                primary={monthNames[trend.month]}
                                secondary={`${trend.travelFrequency} interaction${trend.travelFrequency !== 1 ? 's' : ''}`}
                              />
                            </ListItem>
                          )
                        })}
                    </List>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">
                      Meeting Insights
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box textAlign="center">
                          <Typography variant="h4" color="primary">
                            {travelHistory.reduce(
                              (sum, h) => sum + h.meetingsHeld,
                              0
                            )}
                          </Typography>
                          <Typography variant="caption">
                            Total Meetings
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box textAlign="center">
                          <Typography variant="h4" color="success.main">
                            {
                              travelHistory.filter(
                                h => h.outcome === 'positive'
                              ).length
                            }
                          </Typography>
                          <Typography variant="caption">
                            Positive Outcomes
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box textAlign="center">
                          <Typography variant="h4" color="warning.main">
                            {
                              travelHistory.filter(h => h.followUpRequired)
                                .length
                            }
                          </Typography>
                          <Typography variant="caption">
                            Need Follow-up
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box textAlign="center">
                          <Typography variant="h4" color="primary">
                            {travelPatterns.frequentDestinations.length}
                          </Typography>
                          <Typography variant="caption">
                            Destinations
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  )
}

export default TravelHistoryComponent
