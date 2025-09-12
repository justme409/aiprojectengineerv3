'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, Settings, Users, CheckCircle, AlertTriangle, Clock, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface QseStats {
  totalDocuments: number
  approvedDocuments: number
  draftDocuments: number
  pendingReview: number
  expiringSoon: number
}

interface QseCategory {
  id: string
  name: string
  description: string
  documentCount: number
  status: 'complete' | 'incomplete' | 'in_progress'
  lastUpdated: string
}

export default function QsePage() {
  const [stats, setStats] = useState<QseStats>({
    totalDocuments: 0,
    approvedDocuments: 0,
    draftDocuments: 0,
    pendingReview: 0,
    expiringSoon: 0,
  })
  const [categories, setCategories] = useState<QseCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQseData()
  }, [])

  const fetchQseData = async () => {
    try {
      // Fetch QSE documents to calculate stats
      const response = await fetch('/api/v1/qse')
      if (response.ok) {
        const data = await response.json()
        const documents = data.documents || []

        // Calculate stats
        const totalDocuments = documents.length
        const approvedDocuments = documents.filter((doc: any) => doc.status === 'approved').length
        const draftDocuments = documents.filter((doc: any) => doc.status === 'draft').length
        const pendingReview = documents.filter((doc: any) => doc.status === 'pending_review').length

        setStats({
          totalDocuments,
          approvedDocuments,
          draftDocuments,
          pendingReview,
          expiringSoon: 0, // Would need review dates to calculate
        })

        // Set up categories
        setCategories([
          {
            id: 'tier_1',
            name: 'Tier 1 - IMS Manual & Policies',
            description: 'Core management system documentation',
            documentCount: documents.filter((doc: any) => doc.category === 'tier_1').length,
            status: 'complete',
            lastUpdated: new Date().toISOString(),
          },
          {
            id: 'tier_2',
            name: 'Tier 2 - Procedures & Controls',
            description: 'Operational procedures and controls',
            documentCount: documents.filter((doc: any) => doc.category === 'tier_2').length,
            status: 'in_progress',
            lastUpdated: new Date().toISOString(),
          },
          {
            id: 'tier_3',
            name: 'Tier 3 - Work Instructions',
            description: 'Detailed work instructions and forms',
            documentCount: documents.filter((doc: any) => doc.category === 'tier_3').length,
            status: 'incomplete',
            lastUpdated: new Date().toISOString(),
          },
        ])
      }
    } catch (error) {
      console.error('Error fetching QSE data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      complete: 'default',
      in_progress: 'secondary',
      incomplete: 'destructive',
    } as const

    const labels = {
      complete: 'Complete',
      in_progress: 'In Progress',
      incomplete: 'Incomplete',
    }

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">QSE Management System</h1>
          <p className="text-muted-foreground mt-2">Integrated Quality, Safety & Environment Management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            Reports
          </Button>
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            Create Document
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDocuments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approvedDocuments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.draftDocuments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingReview}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.expiringSoon}</div>
          </CardContent>
        </Card>
      </div>

      {/* QSE Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <CardDescription className="mt-2">{category.description}</CardDescription>
                </div>
                {getStatusBadge(category.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold text-primary">
                  {category.documentCount}
                </div>
                <div className="text-sm text-muted-foreground">
                  documents
                </div>
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                Last updated: {new Date(category.lastUpdated).toLocaleDateString()}
              </div>
              <div className="mt-4">
                <Link href={`/qse/${category.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    View Documents
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common QSE management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/qse/corporate-tier-1">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <FileText className="w-6 h-6 mb-2" />
                <span className="text-sm">IMS Manual</span>
              </Button>
            </Link>

            <Link href="/qse/corp-policy-roles">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <Settings className="w-6 h-6 mb-2" />
                <span className="text-sm">Policies</span>
              </Button>
            </Link>

            <Link href="/qse/corp-planning">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <BarChart3 className="w-6 h-6 mb-2" />
                <span className="text-sm">Planning</span>
              </Button>
            </Link>

            <Link href="/qse/corp-operation">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <Users className="w-6 h-6 mb-2" />
                <span className="text-sm">Operations</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
