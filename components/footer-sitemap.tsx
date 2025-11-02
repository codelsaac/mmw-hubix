"use client"

import * as React from "react"
import Link from "next/link"
import { siteConfig } from "@/config/site"
import { Icons } from "@/components/icons"
import { Separator } from "@/components/ui/separator"
import { ClientOnly } from "@/components/ui/client-only"

interface SitemapSection {
  title: string
  links: {
    title: string
    href: string
    description?: string
  }[]
}

const sitemapSections: SitemapSection[] = []

export function FooterSitemap() {
  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" suppressHydrationWarning>
      <div className="container mx-auto max-w-screen-2xl px-4 py-12" suppressHydrationWarning>
        {/* Header Section */}
        <div className="mb-12 text-center" suppressHydrationWarning>
          <div className="mb-4 flex items-center justify-center space-x-2" suppressHydrationWarning>
            <Icons.logo className="h-8 w-8" />
            <h2 className="text-xl font-bold tracking-tight">{siteConfig.name}</h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto" suppressHydrationWarning>
            {siteConfig.description}
          </p>
        </div>

        {/* Sitemap Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4" suppressHydrationWarning>
          {sitemapSections.map((section) => (
            <div key={section.title} className="space-y-4" suppressHydrationWarning>
              <h3 className="text-lg font-semibold text-foreground">
                {section.title}
              </h3>
              <nav className="space-y-3" role="navigation" aria-label={`${section.title} navigation`}>
                {section.links.map((link) => (
                  <div key={link.href} className="group" suppressHydrationWarning>
                    <Link
                      href={link.href}
                      className="block text-sm text-muted-foreground transition-colors hover:text-foreground focus:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
                      target={link.href.startsWith('http') ? '_blank' : undefined}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      <div className="font-medium group-hover:text-primary transition-colors" suppressHydrationWarning>
                        {link.title}
                        {link.href.startsWith('http') && (
                          <Icons.externalLink className="ml-1 inline h-3 w-3" />
                        )}
                      </div>
                      {link.description && (
                        <div className="text-xs text-muted-foreground/80 mt-1 leading-relaxed" suppressHydrationWarning>
                          {link.description}
                        </div>
                      )}
                    </Link>
                  </div>
                ))}
              </nav>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        {/* Footer Bottom */}
        <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0" suppressHydrationWarning>
          <div className="text-center text-sm text-muted-foreground md:text-left">
            <p>
              © <ClientOnly fallback="2025">{new Date().getFullYear()}</ClientOnly> C.C.C. Mong Man Wai College. All rights reserved.
            </p>
            <p className="mt-1">
             The first version was built by the IT Perfect team in 2024-2025.
            </p>
          </div>
          
          {/* Social Links */}
          <div className="flex items-center" suppressHydrationWarning>
            <Link
              href={siteConfig.links.schoolSite}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm p-1"
              aria-label="School Website"
            >
              <Icons.school className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
