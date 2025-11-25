"use client"

import type React from "react"
import { SessionProvider } from "next-auth/react"
import { ErrorBoundary } from "@/components/error-boundary"
import { PageTransition } from "@/components/page-transition"
import { BrowserExtensionCleanup } from "@/components/browser-extension-cleanup"
import { Header } from "@/components/header"
import { FooterSitemap } from "@/components/footer-sitemap"
import { AIChatWidget } from "@/components/ai-chat-widget"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      refetchOnWindowFocus={false}
      refetchInterval={0}
    >
      <BrowserExtensionCleanup />
      <ErrorBoundary>
        <div className="relative flex min-h-screen flex-col bg-background">
          <Header />
          <main className="flex-1 flex flex-col">
            <PageTransition>{children}</PageTransition>
          </main>
          <FooterSitemap />
          <AIChatWidget />
        </div>
      </ErrorBoundary>
    </SessionProvider>
  )
}