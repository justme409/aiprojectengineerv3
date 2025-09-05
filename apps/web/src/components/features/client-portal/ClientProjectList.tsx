'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, MapPin, Users, FileText, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Project {
  id: string
  name: string
  description: string
  location: string
  clientName: string
  status: 'active' | 'completed' | 'on_hold'
  startDate: string
  endDate?: string
  progress: number
  documentCount: number
  lastActivity: string
}

interface ClientProjectListProps {
  projects?: Project[]
}

export default function ClientProjectList({ projects: initialProjects }: ClientProjectListProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects || [])
  const [loading, setLoading] = useState(!initialProjects)

  useEffect(() => {
    if (!initialProjects) {
      fetchProjects()
    }
  }, [initialProjects])

  const fetchProjects = async () => {
    try {
      // In a real implementation, this would fetch from an API
      // For now, using mock data
      const mockProjects: Project[] = [
        {
          id: '1',
          name: 'Highway Construction Project',
          description: 'Major highway reconstruction and expansion',
          location: 'Sydney, NSW',
          clientName: 'NSW Roads & Maritime',
          status: 'active',
          startDate: '2024-01-15',
          progress: 65,
          documentCount: 234,
          lastActivity: '2024-09-15T10:30:00Z',
        },
        {
          id: '2',
          name: 'Bridge Rehabilitation',
          description: 'Structural rehabilitation of historic bridge',
          location: 'Melbourne, VIC',
          clientName: 'VicRoads',
          status: 'active',
          startDate: '2024-03-01',
          progress: 32,
          documentCount: 156,
          lastActivity: '2024-09-14T14:20:00Z',
        },
        {
          id: '3',
          name: 'Railway Upgrade',
          description: 'Railway line upgrade and modernization',
          location: 'Brisbane, QLD',
          clientName: 'Queensland Rail',
          status: 'on_hold',
          startDate: '2024-02-01',
          progress: 15,
          documentCount: 89,
          lastActivity: '2024-09-10T09:15:00Z',
        },
      ]

      setProjects(mockProjects)
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      completed: 'secondary',
      on_hold: 'destructive',
    } as const

    const labels = {
      active: 'Active',
      completed: 'Completed',
      on_hold: 'On Hold',
    }

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 60) return 'bg-yellow-500'
    if (progress >= 30) return 'bg-orange-500'
    return 'bg-red-500'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Projects</h2>
          <p className="text-gray-600 mt-1">Projects you're involved with</p>
        </div>
        <div className="text-sm text-gray-500">
          {projects.length} project{projects.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{project.name}</CardTitle>
                  <CardDescription className="mt-1">{project.clientName}</CardDescription>
                </div>
                {getStatusBadge(project.status)}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>

              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                {project.location}
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                Started {new Date(project.startDate).toLocaleDateString()}
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.progress)}`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex justify-between text-sm text-gray-600">
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-1" />
                  {project.documentCount} docs
                </div>
                <div>
                  Updated {new Date(project.lastActivity).toLocaleDateString()}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2">
                <Link href={`/portal/projects/${project.id}/dashboard`}>
                  <Button className="w-full">
                    View Project
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-600">
            You don't have any active projects at the moment.
          </p>
        </div>
      )}
    </div>
  )
}
