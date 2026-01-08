import { useState, useEffect } from 'react'
import Chip, { type ChipProps } from '@mui/material/Chip'
import AccessTimeIcon from '@mui/icons-material/AccessTime'

// Get Julian date (day of year 001-366) and Zulu/UTC time
function getJulianZuluTime(): string {
  const now = new Date()

  // Calculate day of year using UTC to avoid timezone issues
  const startOfYear = Date.UTC(now.getUTCFullYear(), 0, 0)
  const nowUTC = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  )
  const oneDay = 1000 * 60 * 60 * 24
  const dayOfYear = Math.floor((nowUTC - startOfYear) / oneDay)

  const hours = now.getUTCHours().toString().padStart(2, '0')
  const minutes = now.getUTCMinutes().toString().padStart(2, '0')
  const seconds = now.getUTCSeconds().toString().padStart(2, '0')

  // Format: DDD HH:MM:SSZ (e.g., 002 14:30:52Z)
  return `${dayOfYear.toString().padStart(3, '0')} ${hours}:${minutes}:${seconds}Z`
}

interface JulianClockProps extends Omit<ChipProps, 'label' | 'icon'> {
  showIcon?: boolean
}

export default function JulianClock({ showIcon = true, sx, ...props }: JulianClockProps) {
  const [julianTime, setJulianTime] = useState(getJulianZuluTime())

  useEffect(() => {
    const interval = setInterval(() => {
      setJulianTime(getJulianZuluTime())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Chip
      icon={showIcon ? <AccessTimeIcon sx={{ color: 'inherit !important' }} /> : undefined}
      label={julianTime}
      sx={{
        bgcolor: 'rgba(0,0,0,0.3)',
        color: 'inherit',
        fontFamily: 'monospace',
        fontWeight: 'bold',
        fontSize: '0.95rem',
        letterSpacing: '0.5px',
        py: 0.5,
        ...sx,
      }}
      {...props}
    />
  )
}
