import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { UserProvider } from "@/lib/user-context"
import "@/styles/globals.css"

export const metadata: Metadata = {
  title: "LifeLens - AI-Powered Personal Financial Advisor",
  description:
    "Every life event deserves clear financial guidance. AI-driven support to help you understand benefits, savings, and next steps.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <UserProvider>
          {children}
        </UserProvider>
        <Analytics />
      </body>
    </html>
  )
}
