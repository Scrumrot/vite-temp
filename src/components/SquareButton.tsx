import Button, { type ButtonProps } from '@mui/material/Button'
import { styled } from '@mui/material/styles'

type ButtonSize = 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge'

interface SquareButtonProps extends Omit<ButtonProps, 'startIcon' | 'endIcon' | 'size'> {
  icon: React.ReactNode
  label: string
  size?: ButtonSize
}

const sizeMap: Record<ButtonSize, { button: number; icon: number; fontSize: string }> = {
  small: { button: 64, icon: 20, fontSize: '0.675rem' },
  medium: { button: 80, icon: 24, fontSize: '0.75rem' },
  large: { button: 100, icon: 32, fontSize: '0.875rem' },
  xlarge: { button: 150, icon: 48, fontSize: '1.3rem' },
  xxlarge: { button: 225, icon: 72, fontSize: '2rem' },
}

const StyledButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'buttonSize',
})<{ buttonSize: ButtonSize }>(({ buttonSize }) => ({
  width: sizeMap[buttonSize].button,
  height: sizeMap[buttonSize].button,
  minWidth: 'unset',
  padding: 8,
  flexDirection: 'column',
  gap: 4,
  '& .MuiButton-startIcon': {
    margin: 0,
  },
  '& .square-button-icon': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& > svg': {
      fontSize: sizeMap[buttonSize].icon,
    },
  },
  '& .square-button-label': {
    fontSize: sizeMap[buttonSize].fontSize,
    lineHeight: 1.2,
    textTransform: 'none',
  },
}))

export default function SquareButton({
  icon,
  label,
  size = 'medium',
  variant = 'outlined',
  ...props
}: SquareButtonProps) {
  return (
    <StyledButton buttonSize={size} variant={variant} {...props}>
      <span className="square-button-icon">{icon}</span>
      <span className="square-button-label">{label}</span>
    </StyledButton>
  )
}
