'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from './theme-provider'
import { Button } from './ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const getIcon = () => {
    if (theme === 'dark') return <Moon className="h-5 w-5" />
    if (theme === 'light') return <Sun className="h-5 w-5" />
    return <Sun className="h-5 w-5 opacity-50" />
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative"
      title={`Theme: ${theme}`}
    >
      {getIcon()}
    </Button>
  )
}
