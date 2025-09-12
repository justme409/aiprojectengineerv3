"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { useAuth } from "@/lib/hooks/use-auth"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings, LogOut, User } from "lucide-react"

interface HeaderSkeletonProps {
  showAuthButtons?: boolean
}

function HeaderSkeleton({ showAuthButtons = false }: HeaderSkeletonProps) {
  return (
    <nav className="flex items-center space-x-1 sm:space-x-2">
      {/* Theme toggle skeleton */}
      <div className="h-8 w-8 rounded bg-muted animate-pulse" />
      {showAuthButtons ? (
        <>
          {/* Sign In button skeleton */}
          <div className="h-8 w-16 bg-muted rounded animate-pulse" />
          {/* Sign Up button skeleton */}
          <div className="h-8 w-18 bg-muted rounded animate-pulse" />
        </>
      ) : (
        /* Avatar skeleton for authenticated state */
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
      )}
    </nav>
  )
}

const navigation = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Pricing", href: "/pricing" },
  { name: "Contact", href: "/contact" },
  { name: "Security", href: "/security" },
]

const appNavigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Projects", href: "/projects" },
  { name: "Account", href: "/account" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const { user, signOut, isLoading } = useAuth()

  const isAppRoute = pathname?.startsWith("/dashboard") || pathname?.startsWith("/projects") || pathname?.startsWith("/account") || pathname?.startsWith("/qse")
  const isClientRoute = pathname?.startsWith("/portal")
  const currentNav = isAppRoute ? appNavigation : navigation

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 text-gray-900 border-gray-200 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
            <span className="font-bold sm:inline-block">
              AI Project Engineer
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2 sm:space-x-4">
          {isLoading ? (
            <HeaderSkeleton showAuthButtons={!user} />
          ) : (
            <nav className="flex items-center space-x-1 sm:space-x-2">
              <ModeToggle />
              {user ? (
                <UserDropdown user={user} onSignOut={signOut} />
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>
      </div>
    </header>
  )
}

interface UserDropdownProps {
  user: any
  onSignOut: () => void
}

function UserDropdown({ user, onSignOut }: UserDropdownProps) {
  const avatarUrl = user?.image || user?.user_metadata?.avatar_url
  const displayName = user?.name || user?.email || 'User'
  const email = user?.email

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback>
            {displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="text-sm font-medium">{displayName}</p>
            {email && (
              <p className="text-xs text-muted-foreground">{email}</p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={(event) => {
            event.preventDefault()
            onSignOut()
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
