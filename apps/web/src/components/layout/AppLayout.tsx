"use client"

import { ReactNode, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { SiteHeader } from './SiteHeader'
import { Sidebar } from './Sidebar'
import { Breadcrumbs } from './Breadcrumbs'
import { cn } from '@/lib/utils'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  const isAppRoute = pathname?.startsWith('/dashboard') || pathname?.startsWith('/projects') || pathname?.startsWith('/account') || pathname?.startsWith('/qse')

  // State to track sidebar collapse status
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Update CSS variable for sidebar width
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const width = sidebarCollapsed ? '64px' : '256px'
      document.documentElement.style.setProperty('--sidebar-width', width)
    }
  }, [sidebarCollapsed])

  // Handle sidebar collapse from sidebar component
  const handleSidebarToggle = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed)
  }

  if (!isAppRoute) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="flex-1">
          {children}
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="flex pt-5">
        <div className="flex flex-col fixed inset-y-0 pt-14 border-r bg-card">
          <div className="flex-1 flex flex-col min-h-0">
            <Sidebar
              onCollapseChange={handleSidebarToggle}
              className="flex-1"
            />
          </div>
        </div>
        <div
          className={cn(
            "flex flex-col flex-1 transition-all duration-300",
            sidebarCollapsed
              ? "ml-16"
              : "ml-64"
          )}
        >
          <Breadcrumbs />
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 py-[3px] max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
