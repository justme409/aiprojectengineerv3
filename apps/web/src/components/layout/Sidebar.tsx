"use client"

import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, FolderOpen } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"

interface Project {
  id: string
  name: string
  description?: string
  location?: string
  client_name?: string
  created_at: string
  organization_name: string
  projectAsset?: {
    name?: string
    content?: {
      client?: string
      client_name?: string
      project_address?: string
      location?: string
    }
  }
  displayName?: string
  displayClient?: string
}

interface SidebarProps {
  className?: string
  onCollapseChange?: (collapsed: boolean) => void
}

export function Sidebar({ className, onCollapseChange }: SidebarProps) {
  const pathname = usePathname()
  const params = useParams()
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState(false)

  // Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return

      try {
        const response = await fetch('/api/v1/projects?enriched=true')
        if (response.ok) {
          const data = await response.json()
          // Ensure projects are sorted by created date (newest first)
          const sortedProjects = (data.projects || []).sort((a: Project, b: Project) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
          setProjects(sortedProjects)
        }
      } catch (error) {
        console.error('Error fetching projects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [user])

  // Update sidebar width CSS variable
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const width = collapsed ? '64px' : '256px'
      document.documentElement.style.setProperty('--sidebar-width', width)
    }
  }, [collapsed])

  // Generate 3-letter abbreviation for project name
  const getProjectAbbrev = (displayName: string): string => {
    if (!displayName) return 'UNK'
    const words = displayName.split(/\s+/)
    if (words.length >= 3) {
      return words.slice(0, 3).map(word => word.charAt(0).toUpperCase()).join('')
    } else if (words.length === 2) {
      const first = words[0].charAt(0).toUpperCase()
      const second = words[1].slice(0, 2).toUpperCase()
      return (first + second).slice(0, 3)
    } else {
      return displayName.slice(0, 3).toUpperCase()
    }
  }

  // Ensure unique abbreviations
  const getUniqueAbbrev = (displayName: string, allProjects: Project[]): string => {
    const baseAbbrev = getProjectAbbrev(displayName)
    let abbrev = baseAbbrev
    let counter = 1

    while (allProjects.some(p => p.id !== params.projectId && getProjectAbbrev(p.displayName || p.name) === abbrev)) {
      if (counter === 1) {
        abbrev = baseAbbrev.slice(0, 2) + counter.toString()
      } else {
        abbrev = baseAbbrev.slice(0, 2) + counter.toString()
      }
      counter++
      if (counter > 9) break // Prevent infinite loop
    }

    return abbrev
  }

  const isActive = (projectId: string) => {
    return pathname?.includes(`/projects/${projectId}`)
  }

  if (loading) {
    return (
      <div
        className={cn("bg-white border-r border-gray-200 h-full flex flex-col", className)}
        style={{ width: collapsed ? 64 : 256 }}
      >
        <div className="p-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn("bg-white border-r border-gray-200 h-full overflow-y-auto relative flex flex-col transition-all duration-300 ease-in-out", className)}
      style={{ width: collapsed ? 64 : 256 }}
    >
      {/* Header */}
      {!collapsed ? (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 transition-all duration-300 ease-in-out">
          <div className="flex-1">
            <h2 className="text-base font-semibold text-gray-900">Projects</h2>
          </div>
          <button
            onClick={() => {
              setCollapsed(true)
              onCollapseChange?.(true)
            }}
            className="h-7 w-7 grid place-items-center rounded hover:bg-gray-100 transition-all duration-200 ease-in-out"
            aria-label="Collapse sidebar"
            title="Collapse"
          >
            <ChevronLeft className="h-4 w-4 text-gray-700 transition-transform duration-300 ease-in-out" />
          </button>
        </div>
      ) : (
        <div className="flex justify-center py-3 border-b border-gray-200 transition-all duration-300 ease-in-out">
          <button
            onClick={() => {
              setCollapsed(false)
              onCollapseChange?.(false)
            }}
            className="h-7 w-7 grid place-items-center rounded hover:bg-gray-100 transition-all duration-200 ease-in-out"
            aria-label="Expand sidebar"
            title="Expand"
          >
            <ChevronRight className="h-4 w-4 text-gray-700 transition-transform duration-300 ease-in-out" />
          </button>
        </div>
      )}

      {/* Projects List */}
      <div className="flex-1 p-2 transition-all duration-300 ease-in-out">
          <div className="space-y-1">
          {projects.length === 0 ? (
            <div className="px-2 py-3 text-xs text-gray-500 text-center">
              {collapsed ? 'No projects' : 'No projects found'}
            </div>
          ) : (
            projects.map((project) => {
              const displayName = project.displayName || project.name || `Project ${project.id.slice(0, 8)}`
              const abbrev = getUniqueAbbrev(displayName, projects)
              const active = isActive(project.id)

              return (
                <div key={project.id}>
                  {!collapsed ? (
                    <Link
                      href={`/projects/${project.id}/overview`}
                      title={displayName}
                      className={cn(
                        "flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer rounded",
                        active ? "bg-accent border-r-2 border-primary" : ""
                      )}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded text-xs font-medium text-gray-700 flex-shrink-0">
                          <FolderOpen className="h-3 w-3" />
                        </div>
                        <span className="text-sm font-medium truncate text-gray-700">
                          {displayName}
                        </span>
                      </div>
                    </Link>
                  ) : (
                    <Link href={`/projects/${project.id}/overview`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "w-full h-9 hover:bg-gray-100",
                          active ? "bg-accent" : ""
                        )}
                        title={displayName}
                      >
                        <span className="text-xs font-semibold text-gray-700">
                          {abbrev}
                        </span>
                      </Button>
                    </Link>
                  )}
                </div>
              )
            })
                )}
        </div>
      </div>

    </div>
  )
}
