"use client"

import { Button } from "@/components/ui/button"

interface TopNavProps {
  onSupportClick?: () => void
}

export function TopNav({ onSupportClick }: TopNavProps) {
  return (
    <header className="border-b border-[#A41E34]/15 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#A41E34] to-[#FF4F00]/80 text-white shadow-md">
            <span className="text-sm font-semibold">LL</span>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#A41E34]">LifeLens</p>
            <p className="text-sm font-medium text-[#1E1E1E]">Benefits guidance for every moment</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="hidden rounded-xl border-[#A41E34]/30 bg-white px-4 py-2 text-sm font-semibold text-[#A41E34] shadow-sm hover:bg-[#A41E34]/10 sm:inline-flex"
          onClick={onSupportClick}
        >
          Contact support
        </Button>
      </div>
    </header>
  )
}
