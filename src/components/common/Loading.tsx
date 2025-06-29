import React from 'react'
import {
  Box,
  CircularProgress,
  LinearProgress,
  Skeleton,
  Typography,
  Card,
  CardContent,
  Backdrop,
  keyframes,
} from '@mui/material'

// Animations (keeping for DotsLoader component)
// const pulse = keyframes`
//   0% {
//     opacity: 1;
//   }
//   50% {
//     opacity: 0.4;
//   }
//   100% {
//     opacity: 1;
//   }
// `

// const spin = keyframes`
//   0% {
//     transform: rotate(0deg);
//   }
//   100% {
//     transform: rotate(360deg);
//   }
// `

// Styled Components (unused but keeping for future use)
// const StyledSpinner = styled(Box)(() => ({
//   animation: `${spin} 1s linear infinite`,
//   display: 'inline-block',
// }))

// const PulsatingBox = styled(Box)(() => ({
//   animation: `${pulse} 1.5s ease-in-out infinite`,
// }))

// Basic Spinner Component
export interface SpinnerProps {
  size?: number
  color?: 'primary' | 'secondary' | 'inherit'
  thickness?: number
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 40,
  color = 'primary',
  thickness = 3.6,
}) => {
  return <CircularProgress size={size} color={color} thickness={thickness} />
}

// Progress Bar Component
export interface ProgressBarProps {
  value?: number
  variant?: 'determinate' | 'indeterminate'
  color?: 'primary' | 'secondary'
  height?: number
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  variant = 'indeterminate',
  color = 'primary',
  height = 4,
}) => {
  return (
    <LinearProgress
      variant={variant}
      value={value}
      color={color}
      sx={{ height }}
    />
  )
}

// Loading Overlay Component
export interface LoadingOverlayProps {
  open: boolean
  message?: string
  backdrop?: boolean
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  open,
  message = 'Loading...',
  backdrop = true,
}) => {
  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        p: 3,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <Spinner size={48} />
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Box>
  )

  if (backdrop) {
    return (
      <Backdrop
        open={open}
        sx={{
          zIndex: theme => theme.zIndex.modal + 1,
          color: 'common.white',
        }}
      >
        {content}
      </Backdrop>
    )
  }

  return open ? (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 1,
      }}
    >
      {content}
    </Box>
  ) : null
}

// Skeleton Components
export interface SkeletonTextProps {
  lines?: number
  width?: string | number
  height?: number
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 1,
  width = '100%',
  height = 20,
}) => {
  return (
    <Box>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 ? '70%' : width}
          height={height}
          sx={{ mb: 0.5 }}
        />
      ))}
    </Box>
  )
}

export const SkeletonCard: React.FC = () => {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flexGrow: 1 }}>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="40%" height={16} />
          </Box>
        </Box>
        <SkeletonText lines={3} />
      </CardContent>
    </Card>
  )
}

export const SkeletonContactCard: React.FC = () => {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Skeleton variant="circular" width={56} height={56} />
          <Box sx={{ flexGrow: 1 }}>
            <Skeleton variant="text" width="70%" height={24} />
            <Skeleton variant="text" width="50%" height={16} />
          </Box>
          <Skeleton
            variant="rectangular"
            width={80}
            height={24}
            sx={{ borderRadius: 1 }}
          />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="60%" />
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Skeleton
            variant="rectangular"
            width={60}
            height={24}
            sx={{ borderRadius: 1 }}
          />
          <Skeleton
            variant="rectangular"
            width={80}
            height={24}
            sx={{ borderRadius: 1 }}
          />
          <Skeleton
            variant="rectangular"
            width={70}
            height={24}
            sx={{ borderRadius: 1 }}
          />
        </Box>
      </CardContent>
    </Card>
  )
}

export const SkeletonMeetingCard: React.FC = () => {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Skeleton variant="text" width="80%" height={24} />
            <Skeleton variant="text" width="60%" height={16} />
          </Box>
          <Skeleton
            variant="rectangular"
            width={80}
            height={24}
            sx={{ borderRadius: 1 }}
          />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="50%" />
          <Skeleton variant="text" width="40%" />
        </Box>
      </CardContent>
    </Card>
  )
}

export const SkeletonMetricCard: React.FC = () => {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Skeleton variant="text" width="60%" height={16} />
          <Skeleton variant="circular" width={24} height={24} />
        </Box>
        <Skeleton variant="text" width="40%" height={40} sx={{ mb: 1 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Skeleton variant="text" width={60} height={16} />
          <Skeleton variant="text" width={80} height={16} />
        </Box>
      </CardContent>
    </Card>
  )
}

export const SkeletonTable: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => {
  return (
    <Box>
      {/* Table Header */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, p: 2, bgcolor: 'grey.50' }}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton
            key={`header-${index}`}
            variant="text"
            width="100%"
            height={20}
          />
        ))}
      </Box>

      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <Box key={rowIndex} sx={{ display: 'flex', gap: 2, mb: 1, p: 2 }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              variant="text"
              width="100%"
              height={16}
            />
          ))}
        </Box>
      ))}
    </Box>
  )
}

// List Skeleton
export const SkeletonList: React.FC<{ items?: number }> = ({ items = 5 }) => {
  return (
    <Box>
      {Array.from({ length: items }).map((_, index) => (
        <Box
          key={index}
          sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}
        >
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flexGrow: 1 }}>
            <Skeleton variant="text" width="70%" height={20} />
            <Skeleton variant="text" width="50%" height={16} />
          </Box>
          <Skeleton
            variant="rectangular"
            width={80}
            height={32}
            sx={{ borderRadius: 1 }}
          />
        </Box>
      ))}
    </Box>
  )
}

// Dots Loading Animation
export const DotsLoader: React.FC<{ size?: number }> = ({ size = 8 }) => {
  const dot1 = keyframes`
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  `

  const dot2 = keyframes`
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  `

  const dot3 = keyframes`
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  `

  return (
    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
      <Box
        sx={{
          width: size,
          height: size,
          bgcolor: 'primary.main',
          borderRadius: '50%',
          animation: `${dot1} 1.4s ease-in-out infinite both`,
          animationDelay: '-0.32s',
        }}
      />
      <Box
        sx={{
          width: size,
          height: size,
          bgcolor: 'primary.main',
          borderRadius: '50%',
          animation: `${dot2} 1.4s ease-in-out infinite both`,
          animationDelay: '-0.16s',
        }}
      />
      <Box
        sx={{
          width: size,
          height: size,
          bgcolor: 'primary.main',
          borderRadius: '50%',
          animation: `${dot3} 1.4s ease-in-out infinite both`,
        }}
      />
    </Box>
  )
}

export default {
  Spinner,
  ProgressBar,
  LoadingOverlay,
  SkeletonText,
  SkeletonCard,
  SkeletonContactCard,
  SkeletonMeetingCard,
  SkeletonMetricCard,
  SkeletonTable,
  SkeletonList,
  DotsLoader,
}
