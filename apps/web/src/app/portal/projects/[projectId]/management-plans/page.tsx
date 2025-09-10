'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FileText,
  Shield,
  TreePine,
  HardHat,
  Truck,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react'

interface ManagementPlan {
  id: string
  type: 'pqp' | 'emp' | 'ohsmp' | 'tmp'
  title: string
  description: string
  status: 'draft' | 'approved' | 'pending_review'
  generatedAt: string
  documentUrl?: string
  approvalRequired: boolean
  approvedBy?: string
  approvedAt?: string
}

const planTypes = {
  pqp: {
    title: 'Quality Management Plan',
    description: 'Comprehensive quality assurance and control procedures',
    icon: Shield,
    color: 'blue'
  },
  emp: {
    title: 'Environmental Management Plan',
    description: 'Environmental protection and compliance measures',
    icon: TreePine,
    color: 'green'
  },
  ohsmp: {
    title: 'Occupational Health & Safety Management Plan',
    description: 'Workplace health and safety procedures',
    icon: HardHat,
    color: 'red'
  },
  tmp: {
    title: 'Traffic Management Plan',
    description: 'Traffic control and management procedures',
    icon: Truck,
    color: 'yellow'
  }
}

export default function ManagementPlansPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const [plans, setPlans] = useState<ManagementPlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlans()
  }, [projectId])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      // Fetch management plans from assets
      const response = await fetch(`/api/v1/assets?project_id=${projectId}&type=plan`)
      if (response.ok) {
        const data = await response.json()
        // Transform assets into management plans format
        const transformedPlans = transformAssetsToPlans(data.assets || [])
        setPlans(transformedPlans)
      }
    } catch (error) {
      console.error('Error fetching plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const transformAssetsToPlans = (assets: any[]): ManagementPlan[] => {
    // Group assets by plan type and create management plan objects
    const planGroups: { [key: string]: any[] } = {}

    assets.forEach(asset => {
      const planType = asset.content?.plan_type || 'pqp'
      if (!planGroups[planType]) {
        planGroups[planType] = []
      }
      planGroups[planType].push(asset)
    })

    return Object.entries(planGroups).map(([type, assets]) => ({
      id: `${type}-${projectId}`,
      type: type as 'pqp' | 'emp' | 'ohsmp' | 'tmp',
      title: planTypes[type as keyof typeof planTypes]?.title || 'Management Plan',
      description: planTypes[type as keyof typeof planTypes]?.description || '',
      status: assets[0]?.status || 'draft',
      generatedAt: assets[0]?.created_at || new Date().toISOString(),
      documentUrl: assets[0]?.content?.document_url,
      approvalRequired: assets[0]?.content?.approval_required || false,
      approvedBy: assets[0]?.content?.approved_by,
      approvedAt: assets[0]?.content?.approved_at
    }))
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      pending_review: 'outline',
      approved: 'default'
    } as const

    const labels = {
      draft: 'Draft',
      pending_review: 'Pending Review',
      approved: 'Approved'
    }

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending_review':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <h1 className="text-3xl font-bold mb-8 h-8 bg-gray-200 rounded w-1/3"></h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Management Plans</h1>
          <p className="text-gray-600 mt-2">
            View and download project management plans including quality, safety, environmental, and traffic management procedures.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {Object.entries(planTypes).map(([type, config]) => {
            const plan = plans.find(p => p.type === type)
            const IconComponent = config.icon

            return (
              <Card key={type} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <IconComponent className={`h-8 w-8 text-${config.color}-600`} />
                    <div className="flex items-center gap-2">
                      {plan && getStatusIcon(plan.status)}
                      {plan && getStatusBadge(plan.status)}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{config.title}</CardTitle>
                  <CardDescription>{config.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {plan ? (
                      <div className="space-y-3">
                        <div className="text-sm text-gray-600">
                          <div>Generated: {new Date(plan.generatedAt).toLocaleDateString()}</div>
                          {plan.approvedBy && (
                            <div>Approved by: {plan.approvedBy}</div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="mr-2 h-3 w-3" />
                            View
                          </Button>
                          {plan.documentUrl && (
                            <Button variant="outline" size="sm">
                              <Download className="mr-2 h-3 w-3" />
                              Download
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500 mb-3">
                          This plan has not been generated yet.
                        </p>
                        <Button variant="outline" size="sm" disabled>
                          <FileText className="mr-2 h-3 w-3" />
                          Not Available
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Navigation Back to Project */}
        <div className="flex justify-center">
          <Link href={`/portal/projects/${projectId}/dashboard`}>
            <Button variant="outline">
              Back to Project Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
