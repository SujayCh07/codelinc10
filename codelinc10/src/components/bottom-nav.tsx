"use client"

import { BookOpen, Clock, Info, LayoutDashboard, MessageCircle, User } from "lucide-react"

import type { ScreenKey } from "@/lib/types"
import { cn } from "@/lib/utils"

interface BottomNavProps {
  currentScreen: ScreenKey
  onNavigate: (screen: ScreenKey) => void
}

export function BottomNav({ currentScreen, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: "insights", icon: LayoutDashboard, label: "Insights" },
    { id: "timeline", icon: Clock, label: "Timeline" },
    { id: "learn", icon: BookOpen, label: "Learn" },
    { id: "faq", icon: Info, label: "FAQ" },
    { id: "profile", icon: User, label: "Profile" },
  ]

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 w-[min(360px,92vw)] -translate-x-1/2 rounded-3xl border border-[#E2D5D7] bg-white/95 px-2 py-3 shadow-xl shadow-[#A41E34]/15">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentScreen === item.id

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1 text-xs font-semibold transition-all touch-manipulation active:scale-95",
                isActive ? "text-[#A41E34]" : "text-[#6F4D51] hover:text-[#A41E34]",
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "animate-bounce-in")} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
