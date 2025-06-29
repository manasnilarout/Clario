import React, { useState, useRef } from 'react'
import {
  TextField,
  TextFieldProps,
  Select,
  SelectProps,
  MenuItem,
  FormControl,
  FormLabel,
  FormHelperText,
  InputLabel,
  OutlinedInput,
  Chip,
  Box,
  Typography,
  IconButton,
  Autocomplete,
  AutocompleteProps,
  styled,
} from '@mui/material'
// Note: Date picker components require @mui/x-date-pickers package
// import {
//   DatePicker,
//   TimePicker,
//   DateTimePicker,
// } from '@mui/x-date-pickers'
import { CloudUpload, Close } from '@mui/icons-material'

// Styled Components
const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1),
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
      },
    },
    '&.Mui-focused': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderWidth: 2,
      },
    },
  },
}))

const UploadBox = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
  '&.dragover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light + '10',
  },
}))

// Text Input Component
export interface TextInputProps extends Omit<TextFieldProps, 'variant'> {
  label: string
  error?: boolean
  helperText?: string
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error = false,
  helperText,
  fullWidth = true,
  ...props
}) => {
  return (
    <StyledFormControl fullWidth={fullWidth} error={error}>
      <TextField
        label={label}
        variant="outlined"
        error={error}
        helperText={helperText}
        fullWidth={fullWidth}
        {...props}
      />
    </StyledFormControl>
  )
}

// Select Component
export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface SelectInputProps extends Omit<SelectProps, 'variant'> {
  label: string
  options: SelectOption[]
  error?: boolean
  helperText?: string
  fullWidth?: boolean
}

export const SelectInput: React.FC<SelectInputProps> = ({
  label,
  options,
  error = false,
  helperText,
  fullWidth = true,
  ...props
}) => {
  return (
    <StyledFormControl fullWidth={fullWidth} error={error}>
      <InputLabel>{label}</InputLabel>
      <Select label={label} input={<OutlinedInput label={label} />} {...props}>
        {options.map(option => (
          <MenuItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </StyledFormControl>
  )
}

// Autocomplete Component
export interface AutocompleteInputProps<T>
  extends Omit<AutocompleteProps<T, false, false, false>, 'renderInput'> {
  label: string
  error?: boolean
  helperText?: string
  placeholder?: string
}

export const AutocompleteInput = <T extends any>({
  label,
  error = false,
  helperText,
  placeholder,
  ...props
}: AutocompleteInputProps<T>) => {
  return (
    <StyledFormControl fullWidth error={error}>
      <Autocomplete
        renderInput={params => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            error={error}
            helperText={helperText}
          />
        )}
        {...props}
      />
    </StyledFormControl>
  )
}

// Tags Input Component
export interface TagsInputProps {
  label: string
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  error?: boolean
  helperText?: string
  suggestions?: string[]
}

export const TagsInput: React.FC<TagsInputProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Add tags...',
  error = false,
  helperText,
  suggestions = [],
}) => {
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !value.includes(trimmedTag)) {
      onChange([...value, trimmedTag])
    }
    setInputValue('')
    setShowSuggestions(false)
  }

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove))
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      handleAddTag(inputValue)
    }
  }

  const filteredSuggestions = suggestions.filter(
    suggestion =>
      !value.includes(suggestion) &&
      suggestion.toLowerCase().includes(inputValue.toLowerCase())
  )

  return (
    <StyledFormControl fullWidth error={error}>
      <FormLabel>{label}</FormLabel>
      <Box
        sx={{
          border: 1,
          borderColor: error ? 'error.main' : 'divider',
          borderRadius: 1,
          p: 1,
          minHeight: 56,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.5,
          alignItems: 'center',
          '&:focus-within': {
            borderColor: 'primary.main',
            borderWidth: 2,
          },
        }}
      >
        {value.map(tag => (
          <Chip
            key={tag}
            label={tag}
            onDelete={() => handleRemoveTag(tag)}
            size="small"
            deleteIcon={<Close />}
          />
        ))}
        <TextField
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={value.length === 0 ? placeholder : ''}
          variant="standard"
          sx={{
            flexGrow: 1,
            minWidth: 120,
            '& .MuiInput-underline:before': { display: 'none' },
            '& .MuiInput-underline:after': { display: 'none' },
          }}
          InputProps={{
            disableUnderline: true,
          }}
        />
      </Box>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            boxShadow: 2,
            maxHeight: 200,
            overflow: 'auto',
          }}
        >
          {filteredSuggestions.map(suggestion => (
            <Box
              key={suggestion}
              sx={{
                p: 1,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
              onClick={() => handleAddTag(suggestion)}
            >
              {suggestion}
            </Box>
          ))}
        </Box>
      )}

      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </StyledFormControl>
  )
}

// Date/Time Components
export interface DateInputProps {
  label: string
  value: Date | null
  onChange: (date: Date | null) => void
  error?: boolean
  helperText?: string
  minDate?: Date
  maxDate?: Date
}

// Date/Time picker components - requires @mui/x-date-pickers installation
// Commented out until package is installed
/*
export const DateInput: React.FC<DateInputProps> = ({
  label,
  value,
  onChange,
  error = false,
  helperText,
  minDate,
  maxDate,
}) => {
  return (
    <StyledFormControl fullWidth error={error}>
      <DatePicker
        label={label}
        value={value}
        onChange={onChange}
        minDate={minDate}
        maxDate={maxDate}
        slots={{
          openPickerIcon: CalendarToday,
        }}
        slotProps={{
          textField: {
            error,
            helperText,
            fullWidth: true,
          },
        }}
      />
    </StyledFormControl>
  )
}

export const TimeInput: React.FC<DateInputProps> = ({
  label,
  value,
  onChange,
  error = false,
  helperText,
}) => {
  return (
    <StyledFormControl fullWidth error={error}>
      <TimePicker
        label={label}
        value={value}
        onChange={onChange}
        slots={{
          openPickerIcon: AccessTime,
        }}
        slotProps={{
          textField: {
            error,
            helperText,
            fullWidth: true,
          },
        }}
      />
    </StyledFormControl>
  )
}

export const DateTimeInput: React.FC<DateInputProps> = ({
  label,
  value,
  onChange,
  error = false,
  helperText,
  minDate,
  maxDate,
}) => {
  return (
    <StyledFormControl fullWidth error={error}>
      <DateTimePicker
        label={label}
        value={value}
        onChange={onChange}
        minDate={minDate}
        maxDate={maxDate}
        slotProps={{
          textField: {
            error,
            helperText,
            fullWidth: true,
          },
        }}
      />
    </StyledFormControl>
  )
}
*/

// File Upload Component
export interface FileUploadProps {
  label: string
  accept?: string
  multiple?: boolean
  maxSize?: number // in bytes
  onFileSelect: (files: File[]) => void
  error?: boolean
  helperText?: string
  files?: File[]
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept,
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB default
  onFileSelect,
  error = false,
  helperText,
  files = [],
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    validateAndSelectFiles(selectedFiles)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
    const droppedFiles = Array.from(event.dataTransfer.files)
    validateAndSelectFiles(droppedFiles)
  }

  const validateAndSelectFiles = (selectedFiles: File[]) => {
    const validFiles = selectedFiles.filter(file => {
      if (file.size > maxSize) {
        console.warn(`File ${file.name} is too large`)
        return false
      }
      return true
    })

    onFileSelect(validFiles)
  }

  const handleRemoveFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index)
    onFileSelect(updatedFiles)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <StyledFormControl fullWidth error={error}>
      <FormLabel>{label}</FormLabel>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <UploadBox
        className={dragOver ? 'dragover' : ''}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={e => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
        <Typography variant="body1" gutterBottom>
          Drag and drop files here, or click to select
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {accept && `Accepted formats: ${accept}`}
          {maxSize && ` • Max size: ${formatFileSize(maxSize)}`}
        </Typography>
      </UploadBox>

      {files.length > 0 && (
        <Box sx={{ mt: 2 }}>
          {files.map((file, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  {file.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(file.size)}
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => handleRemoveFile(index)}>
                <Close />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}

      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </StyledFormControl>
  )
}

export default {
  TextInput,
  SelectInput,
  AutocompleteInput,
  TagsInput,
  FileUpload,
}
