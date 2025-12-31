"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center space-x-2 group-data-[collapsible=icon]:hidden">
        <Sun className="h-4 w-4 text-yellow-500" />
        <Switch disabled />
        <Moon className="h-4 w-4 text-slate-400" />
      </div>
    )
  }

  const isDark = theme === "dark"

  const handleToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light")
  }

  return (
    <>
      {/* Versão expandida */}
      <div className="flex items-center space-x-2 group-data-[collapsible=icon]:hidden">
        <Sun className={`h-4 w-4 transition-colors ${!isDark ? "text-yellow-500" : "text-slate-400"}`} />
        <Switch checked={isDark} onCheckedChange={handleToggle} />
        <Moon className={`h-4 w-4 transition-colors ${isDark ? "text-blue-400" : "text-slate-400"}`} />
      </div>

      {/* Versão colapsada */}
      <div className="hidden group-data-[collapsible=icon]:block">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="h-8 w-8"
          title={isDark ? "Modo Claro" : "Modo Escuro"}
        >
          {isDark ? <Sun className="h-4 w-4 text-yellow-500" /> : <Moon className="h-4 w-4 text-blue-400" />}
        </Button>
      </div>
    </>
  )
}
