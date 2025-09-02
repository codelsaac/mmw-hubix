"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { LogOut, Settings, UserIcon, Shield, LogIn } from "lucide-react"

export function UserMenu() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <Button variant="ghost" size="icon" disabled className="h-10 w-10 rounded-full"><div className="h-5 w-5 animate-spin rounded-full border-b-2 border-gray-900"></div></Button>
  }

  if (status === "unauthenticated" || !session) {
    return (
      <Button onClick={() => signIn("google")} variant="outline">
        <LogIn className="mr-2 h-4 w-4" />
        Prefect Login
      </Button>
    )
  }

  const user = session.user;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.image || "/abstract-profile.png"} alt={user.name || "User"} />
            <AvatarFallback>
              {user.name
                ?.split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              {/* @ts-ignore */}
              <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-xs">
                {/* @ts-ignore */}
                {user.role === "admin" ? (
                  <>
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </>
                ) : (
                  "Prefect"
                )}
              </Badge>
            </div>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <UserIcon className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
