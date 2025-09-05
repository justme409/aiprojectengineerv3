"use client"

import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Home,
  FolderOpen,
  FileText,
  Settings,
  CheckSquare,
  AlertTriangle,
  Truck,
  TestTube,
  Map,
  BarChart3,
  Mail,
  Users,
  Calendar,
  HardHat,
  Wrench,
  FileCheck,
  Shield,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react"
import { useState } from "react"

const sidebarItems = [
  {
    title: "Overview",
    href: "/app/projects/[projectId]/overview",
    icon: Home,
  },
  {
    title: "Documents",
    href: "/app/projects/[projectId]/documents",
    icon: FileText,
  },
  {
    title: "WBS",
    href: "/app/projects/[projectId]/wbs",
    icon: FolderOpen,
  },
  {
    title: "LBS",
    href: "/app/projects/[projectId]/lbs",
    icon: Map,
  },
  {
    title: "Quality",
    href: "/app/projects/[projectId]/quality",
    icon: Shield,
    children: [
      {
        title: "ITP Templates",
        href: "/app/projects/[projectId]/quality/itp-templates",
      },
      {
        title: "ITP Documents",
        href: "/app/projects/[projectId]/quality/itp",
      },
      {
        title: "Lots",
        href: "/app/projects/[projectId]/quality/lots",
      },
      {
        title: "Hold & Witness",
        href: "/app/projects/[projectId]/quality/hold-witness",
      },
      {
        title: "ITP Register",
        href: "/app/projects/[projectId]/quality/itp-register",
      },
      {
        title: "Records",
        href: "/app/projects/[projectId]/quality/records",
      },
      {
        title: "Primary Testing",
        href: "/app/projects/[projectId]/quality/primary-testing",
      },
    ],
  },
  {
    title: "Inspections",
    href: "/app/projects/[projectId]/inspections",
    icon: CheckSquare,
  },
  {
    title: "Materials",
    href: "/app/projects/[projectId]/materials",
    icon: Truck,
  },
  {
    title: "Tests",
    href: "/app/projects/[projectId]/tests",
    icon: TestTube,
  },
  {
    title: "HSE",
    href: "/app/projects/[projectId]/hse",
    icon: HardHat,
    children: [
      {
        title: "SWMS",
        href: "/app/projects/[projectId]/hse/swms",
      },
      {
        title: "Permits",
        href: "/app/projects/[projectId]/hse/permits",
      },
      {
        title: "Toolbox Talks",
        href: "/app/projects/[projectId]/hse/toolbox-talks",
      },
      {
        title: "Safety Walks",
        href: "/app/projects/[projectId]/hse/safety-walks",
      },
      {
        title: "Inductions",
        href: "/app/projects/[projectId]/hse/inductions",
      },
      {
        title: "Incidents",
        href: "/app/projects/[projectId]/hse/incidents",
      },
      {
        title: "CAPA",
        href: "/app/projects/[projectId]/hse/capa",
      },
    ],
  },
  {
    title: "Field",
    href: "/app/projects/[projectId]/field",
    icon: Wrench,
    children: [
      {
        title: "Daily Diaries",
        href: "/app/projects/[projectId]/field/daily-diaries",
      },
      {
        title: "Site Instructions",
        href: "/app/projects/[projectId]/field/site-instructions",
      },
      {
        title: "Timesheets",
        href: "/app/projects/[projectId]/field/timesheets",
      },
      {
        title: "Roster",
        href: "/app/projects/[projectId]/field/roster",
      },
      {
        title: "Plant",
        href: "/app/projects/[projectId]/field/plant",
      },
    ],
  },
  {
    title: "Approvals",
    href: "/app/projects/[projectId]/approvals",
    icon: FileCheck,
    children: [
      {
        title: "Designer",
        href: "/app/projects/[projectId]/approvals/designer",
      },
      {
        title: "Inbox",
        href: "/app/projects/[projectId]/approvals/inbox",
      },
    ],
  },
  {
    title: "Inbox",
    href: "/app/projects/[projectId]/inbox",
    icon: Mail,
  },
  {
    title: "Map",
    href: "/app/projects/[projectId]/map",
    icon: Map,
  },
  {
    title: "Reports",
    href: "/app/projects/[projectId]/reports",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/app/projects/[projectId]/settings",
    icon: Settings,
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const params = useParams()
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleExpanded = (title: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(title)) {
      newExpanded.delete(title)
    } else {
      newExpanded.add(title)
    }
    setExpandedItems(newExpanded)
  }

  const replaceProjectId = (href: string) => {
    return href.replace("[projectId]", params.projectId as string)
  }

  const isActive = (href: string) => {
    return pathname === replaceProjectId(href)
  }

  const isParentActive = (item: any) => {
    if (item.children) {
      return item.children.some((child: any) => isActive(child.href))
    }
    return isActive(item.href)
  }

  return (
    <div className={cn("pb-12 min-h-screen", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Project Navigation
          </h2>
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <div key={item.title}>
                {item.children ? (
                  <>
                    <Button
                      variant={isParentActive(item) ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => toggleExpanded(item.title)}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.title}
                      {expandedItems.has(item.title) ? (
                        <ChevronDown className="ml-auto h-4 w-4" />
                      ) : (
                        <ChevronRight className="ml-auto h-4 w-4" />
                      )}
                    </Button>
                    {expandedItems.has(item.title) && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <Link key={child.title} href={replaceProjectId(child.href)}>
                            <Button
                              variant={isActive(child.href) ? "secondary" : "ghost"}
                              size="sm"
                              className="w-full justify-start"
                            >
                              {child.title}
                            </Button>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link href={replaceProjectId(item.href)}>
                    <Button
                      variant={isActive(item.href) ? "secondary" : "ghost"}
                      className="w-full justify-start"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
