import type React from "react"
import "./globals.css"
import { IBM_Plex_Mono } from "next/font/google"

const ibmPlexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "700"] })

export const metadata = {
  title: "Retro RSS Reader",
  description: "A minimalist retro RSS reader",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={ibmPlexMono.className}>
        <div className="scanlines"></div>
        {children}
      </body>
    </html>
  )
}



import './globals.css'