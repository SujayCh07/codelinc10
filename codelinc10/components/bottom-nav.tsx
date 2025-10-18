"use client"

import { LayoutDashboard, Clock, BookOpen, Info, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface BottomNavProps {
  currentScreen: string
  onNavigate: (screen: any) => void
}

export function BottomNav({ currentScreen, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "timeline", icon: Clock, label: "Timeline" },
    { id: "learning", icon: BookOpen, label: "Learn" },
    { id: "profile", icon: User, label: "Profile" },
    { id: "about", icon: Info, label: "About" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-border/50 safe-area-bottom backdrop-blur-xl">
      <div className="flex items-center justify-around px-2 py-3 max-w-2xl mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentScreen === item.id

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all touch-manipulation active:scale-95",
                isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "animate-bounce-in")} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
