"use client"
import { useEffect, useRef } from "react"
export type OpenChatDetail = { prompt?: string; context?: Record<string, unknown> }
export function openFinMateChat(detail?: OpenChatDetail) {
  if (typeof window !== "undefined")
    window.dispatchEvent(new CustomEvent<OpenChatDetail>("FinMate:chat:open", { detail }))
}
export function ChatBusMount() { const r = useRef(false); useEffect(()=>{ r.current = true }, []); return null }
