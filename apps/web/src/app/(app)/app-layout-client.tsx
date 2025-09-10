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
          <div className="w-64 flex flex-col fixed inset-y-0 pt-14 border-r bg-card">
            <div className="flex-1 flex flex-col min-h-0">
              <Sidebar />
            </div>
          </div>
        )}
        <div className={cn(
          "flex flex-col flex-1",
          isProjectRoute ? "pl-64" : ""
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
