"use client"
import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { Sidebar } from '@/components/layout/Sidebar'

interface AppLayoutClientProps {
  children: ReactNode
}

export default function AppLayoutClient({ children }: AppLayoutClientProps) {
  const pathname = usePathname()
  const isProjectRoute = pathname?.includes('/projects/')

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="flex">
        {isProjectRoute && (
          <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:pt-14">
            <div className="flex-1 flex flex-col min-h-0 border-r bg-card">
              <Sidebar />
            </div>
          </div>
        )}
        <div className={cn(
          "flex flex-col flex-1",
          isProjectRoute ? "md:pl-64" : ""
        )}>
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}
