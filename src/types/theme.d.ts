import '@mui/material/styles'

declare module '@mui/material/styles' {
  interface PaletteColor {
    darker?: string
  }

  interface SimplePaletteColorOptions {
    darker?: string
  }
}
