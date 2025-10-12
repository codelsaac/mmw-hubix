import { MainNav } from "@/components/main-nav"
import { UserMenu } from "@/components/auth/user-menu"
import { NotificationBar } from "@/components/notification-bar"

export function Header() {
  return (
    <header 
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="banner"
      suppressHydrationWarning
    >
      <div className="container flex h-14 items-center px-4 md:px-6" suppressHydrationWarning>
        <MainNav />
        <nav className="ml-auto flex items-center space-x-2" aria-label="User actions" suppressHydrationWarning>
          <NotificationBar />
          <UserMenu />
        </nav>
      </div>
    </header>
  )
}
