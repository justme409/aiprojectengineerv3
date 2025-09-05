"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FolderOpen,
  FileText,
  CheckSquare,
  AlertTriangle,
  TrendingUp,
  Users,
  Calendar,
  Plus,
  ArrowRight,
  Activity,
  Clock,
  Target
} from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"

// Mock data - in real implementation this would come from assets table
const recentProjects = [
  {
    id: "proj-001",
    name: "Sydney Metro Station",
    status: "active",
    progress: 75,
    lastActivity: "2024-01-15",
    pendingItems: 12
  },
  {
    id: "proj-002",
    name: "Highway Bridge Construction",
    status: "active",
    progress: 45,
    lastActivity: "2024-01-14",
    pendingItems: 8
  },
  {
    id: "proj-003",
    name: "Residential Complex",
    status: "planning",
    progress: 20,
    lastActivity: "2024-01-13",
    pendingItems: 5
  }
]

const recentActivities = [
  {
    id: "act-001",
    type: "inspection",
    title: "Foundation inspection completed",
    project: "Sydney Metro Station",
    time: "2 hours ago",
    status: "completed"
  },
  {
    id: "act-002",
    type: "document",
    title: "ITP template updated",
    project: "Highway Bridge Construction",
    time: "4 hours ago",
    status: "updated"
  },
  {
    id: "act-003",
    type: "quality",
    title: "Hold point released",
    project: "Residential Complex",
    time: "6 hours ago",
    status: "approved"
  }
]

const stats = [
  {
    title: "Active Projects",
    value: "8",
    change: "+2",
    icon: FolderOpen,
    trend: "up"
  },
  {
    title: "Pending Inspections",
    value: "24",
    change: "-5",
    icon: CheckSquare,
    trend: "down"
  },
  {
    title: "Open NCRs",
    value: "3",
    change: "+1",
    icon: AlertTriangle,
    trend: "up"
  },
  {
    title: "Team Members",
    value: "12",
    change: "0",
    icon: Users,
    trend: "neutral"
  }
]

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.name || "User"}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your projects today.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/app/projects">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {stat.trend === "up" && <TrendingUp className="mr-1 h-3 w-3 text-red-500" />}
                {stat.trend === "down" && <TrendingUp className="mr-1 h-3 w-3 text-green-500 rotate-180" />}
                <span className={stat.trend === "up" ? "text-red-500" : stat.trend === "down" ? "text-green-500" : ""}>
                  {stat.change}
                </span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Projects</CardTitle>
                <CardDescription>
                  Your most recently active projects
                </CardDescription>
              </div>
              <Link href="/app/projects">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">{project.name}</h3>
                      <Badge
                        variant={project.status === "active" ? "default" : "secondary"}
                      >
                        {project.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {project.progress}% complete
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {project.pendingItems} pending
                      </div>
                    </div>
                  </div>
                  <Link href={`/app/projects/${project.id}/overview`}>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest updates across your projects
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span>{activity.project}</span>
                      <span>•</span>
                      <span>{activity.time}</span>
                    </div>
                  </div>
                  <Badge
                    variant={
                      activity.status === "completed" ? "default" :
                      activity.status === "updated" ? "secondary" :
                      "outline"
                    }
                    className="text-xs"
                  >
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks to get you started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/app/projects">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <FolderOpen className="h-6 w-6" />
                <span className="text-sm">Create Project</span>
              </Button>
            </Link>

            <Link href="/app/qse">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <FileText className="h-6 w-6" />
                <span className="text-sm">QSE Documents</span>
              </Button>
            </Link>

            <Link href="/app/account">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <Users className="h-6 w-6" />
                <span className="text-sm">Team Settings</span>
              </Button>
            </Link>

            <Button variant="outline" className="w-full h-20 flex-col gap-2">
              <Activity className="h-6 w-6" />
              <span className="text-sm">Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
