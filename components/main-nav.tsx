"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { Badge } from "@/components/ui/badge"
import { RoleBasedNav } from "@/components/role-based-nav"

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-6 md:mr-8 flex items-center space-x-2">
          <div className="h-12 w-12 mr-2">
            <Icons.logo className="h-full w-full" />
          </div>
        <span className="hidden font-semibold text-md sm:inline-block">
          {siteConfig.name}
        </span>
      </Link>
      <RoleBasedNav />
    </div>
  )
}
