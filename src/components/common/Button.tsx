import React from 'react'
import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
  CircularProgress,
  Box,
  styled,
} from '@mui/material'

export interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'size'> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'success'
  size?: 'small' | 'medium' | 'large'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

const StyledButton = styled(MuiButton, {
  shouldForwardProp: prop =>
    !['loading', 'icon', 'iconPosition', 'customVariant'].includes(
      prop as string
    ),
})<ButtonProps & { customVariant?: string }>(
  ({ theme, customVariant, size }) => ({
    borderRadius: theme.spacing(1),
    textTransform: 'none',
    fontWeight: 600,
    transition: 'all 0.2s ease-in-out',
    position: 'relative',

    // Size variants
    ...(size === 'small' && {
      padding: theme.spacing(0.75, 2),
      fontSize: '0.875rem',
      minHeight: 32,
    }),

    ...(size === 'medium' && {
      padding: theme.spacing(1, 3),
      fontSize: '1rem',
      minHeight: 40,
    }),

    ...(size === 'large' && {
      padding: theme.spacing(1.5, 4),
      fontSize: '1.125rem',
      minHeight: 48,
    }),

    // Custom variants
    ...(customVariant === 'primary' && {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      boxShadow: theme.shadows[2],
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
        boxShadow: theme.shadows[4],
        transform: 'translateY(-1px)',
      },
      '&:active': {
        transform: 'translateY(0)',
        boxShadow: theme.shadows[2],
      },
    }),

    ...(customVariant === 'secondary' && {
      backgroundColor: 'transparent',
      color: theme.palette.primary.main,
      border: `2px solid ${theme.palette.primary.main}`,
      '&:hover': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        transform: 'translateY(-1px)',
        boxShadow: theme.shadows[2],
      },
    }),

    ...(customVariant === 'tertiary' && {
      backgroundColor: 'transparent',
      color: theme.palette.text.primary,
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
        transform: 'translateY(-1px)',
      },
    }),

    ...(customVariant === 'danger' && {
      backgroundColor: theme.palette.error.main,
      color: theme.palette.error.contrastText,
      boxShadow: theme.shadows[2],
      '&:hover': {
        backgroundColor: theme.palette.error.dark,
        boxShadow: theme.shadows[4],
        transform: 'translateY(-1px)',
      },
    }),

    ...(customVariant === 'success' && {
      backgroundColor: theme.palette.success.main,
      color: theme.palette.success.contrastText,
      boxShadow: theme.shadows[2],
      '&:hover': {
        backgroundColor: theme.palette.success.dark,
        boxShadow: theme.shadows[4],
        transform: 'translateY(-1px)',
      },
    }),

    '&:disabled': {
      transform: 'none',
      boxShadow: 'none',
      opacity: 0.6,
    },
  })
)

export const Button: React.FC<ButtonProps> = ({
  children,
  loading = false,
  icon,
  iconPosition = 'left',
  disabled,
  variant = 'primary',
  size = 'medium',
  ...props
}) => {
  const showLoadingSpinner = loading
  const isDisabled = disabled || loading

  const buttonContent = (
    <>
      {showLoadingSpinner && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <CircularProgress
            size={size === 'small' ? 16 : size === 'large' ? 24 : 20}
            color="inherit"
          />
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          opacity: showLoadingSpinner ? 0 : 1,
          transition: 'opacity 0.2s ease-in-out',
        }}
      >
        {icon && iconPosition === 'left' && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>{icon}</Box>
        )}

        {children}

        {icon && iconPosition === 'right' && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>{icon}</Box>
        )}
      </Box>
    </>
  )

  return (
    <StyledButton
      disabled={isDisabled}
      {...(loading && { loading })}
      {...(icon && { icon })}
      {...(iconPosition && { iconPosition })}
      customVariant={variant}
      size={size}
      {...props}
    >
      {buttonContent}
    </StyledButton>
  )
}

export default Button
