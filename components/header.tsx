import Link from "next/link"
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { UserMenu } from "@/components/auth/user-menu"
import { NotificationBar } from "@/components/notification-bar"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { siteConfig } from "@/config/site"

export function Header() {
  return (
    <header 
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="banner"
      suppressHydrationWarning
    >
      <div className="container flex h-24 items-center px-4 md:px-6" suppressHydrationWarning>
        <MainNav />
        <MobileNav />
        <nav className="ml-auto flex items-center space-x-2" aria-label="User actions" suppressHydrationWarning>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="hidden md:inline-flex"
          >
            <Link
              href={siteConfig.links.schoolSite}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Icons.school className="h-4 w-4" />
              <span>School Website</span>
            </Link>
          </Button>
          <NotificationBar />
          <UserMenu />
        </nav>
      </div>
    </header>
  )
}
