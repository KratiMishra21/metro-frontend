"use client"

import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ThemeToggleProps {
  isDark: boolean
  setIsDark: (value: boolean) => void
}

export default function ThemeToggle({ isDark, setIsDark }: ThemeToggleProps) {
  return (
    <Button
      size="icon"
      variant="outline"
      onClick={() => setIsDark(!isDark)}
      className="rounded-full border-white/20 hover:border-white/40 hover:bg-white/5"
    >
      {isDark ? <Sun className="h-4 w-4 text-yellow-400" /> : <Moon className="h-4 w-4 text-blue-400" />}
    </Button>
  )
}
