import type React from "react"
import type { Metadata, Viewport } from "next"
import { Source_Sans_3, Playfair_Display } from "next/font/google"
import { siteConfig } from "@/config/site"
import "./globals.css"
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { cn } from "@/lib/utils"
import { Header } from "@/components/header";
import { FooterSitemap } from "@/components/footer-sitemap";
import { SessionProvider } from "@/components/auth/session-provider";
import { ErrorBoundary } from "@/components/error-boundary";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-sans",
})

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          sourceSans.variable
        )}
        suppressHydrationWarning={true}
      >
        <SessionProvider session={session}>
          <ErrorBoundary>
            <div className="relative flex min-h-screen flex-col bg-background">
              <Header />
              <main className="flex-1">{children}</main>
              <FooterSitemap />
            </div>
          </ErrorBoundary>
        </SessionProvider>
      </body>
    </html>
  )
}
