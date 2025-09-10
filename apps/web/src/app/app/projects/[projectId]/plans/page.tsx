'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
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
  Plus,
  Eye,
  Download,
  Calendar,
  User
} from 'lucide-react'

interface PlanItem {
  id: string
  title: string
  description: string
  type: string
  status: 'draft' | 'approved' | 'pending_review'
  lastUpdated: string
  updatedBy?: string
  documentCount?: number
}

interface ManagementPlan {
  id: string
  type: 'pqp' | 'emp' | 'ohsmp' | 'tmp'
  title: string
  description: string
  status: 'draft' | 'approved' | 'pending_review'
  generatedAt: string
  items: PlanItem[]
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

export default function ProjectPlansPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const [plans, setPlans] = useState<ManagementPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlanType, setSelectedPlanType] = useState<string>('pqp')

  useEffect(() => {
    fetchPlans()
  }, [projectId])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      // Fetch existing plans from assets
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
      items: assets.map(asset => ({
        id: asset.id,
        title: asset.name,
        description: asset.content?.description || '',
        type: asset.subtype || 'section',
        status: asset.status,
        lastUpdated: asset.updated_at,
        updatedBy: asset.updated_by,
        documentCount: asset.content?.document_count || 0
      }))
    }))
  }

  const generatePlan = async (planType: string) => {
    try {
      const response = await fetch('/api/v1/projects/[projectId]/ai/plan-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          planType
        })
      })

      if (response.ok) {
        // Refresh plans after generation
        fetchPlans()
      } else {
        console.error('Failed to generate plan')
      }
    } catch (error) {
      console.error('Error generating plan:', error)
    }
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <h1 className="text-3xl font-bold mb-8 h-8 bg-gray-200 rounded w-1/3"></h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Project Plans</h1>
          <p className="text-muted-foreground mt-2">
            Manage quality, environmental, safety, and traffic management plans
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Generate Plan
          </Button>
        </div>
      </div>

      {/* Plan Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(planTypes).map(([type, config]) => {
          const plan = plans.find(p => p.type === type)
          const IconComponent = config.icon

          return (
            <Card key={type} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <IconComponent className={`h-8 w-8 text-${config.color}-600`} />
                  {plan && getStatusBadge(plan.status)}
                </div>
                <CardTitle className="text-lg">{config.title}</CardTitle>
                <CardDescription>{config.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold">
                    {plan?.items?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    sections
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {plan ? (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="mr-2 h-3 w-3" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => generatePlan(type)}
                    >
                      <Plus className="mr-2 h-3 w-3" />
                      Generate
                    </Button>
                  )}
                </div>
                {plan && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Updated {new Date(plan.generatedAt).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Detailed Plan View */}
      {plans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Plan Details</CardTitle>
            <CardDescription>
              Detailed view of management plan sections and requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedPlanType} onValueChange={setSelectedPlanType}>
              <TabsList className="grid w-full grid-cols-4">
                {plans.map(plan => (
                  <TabsTrigger key={plan.type} value={plan.type}>
                    {planTypes[plan.type]?.title}
                  </TabsTrigger>
                ))}
              </TabsList>

              {plans.map(plan => (
                <TabsContent key={plan.type} value={plan.type} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plan.items.map(item => (
                      <Card key={item.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{item.title}</CardTitle>
                            {getStatusBadge(item.status)}
                          </div>
                          <CardDescription className="text-sm">
                            {item.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              {new Date(item.lastUpdated).toLocaleDateString()}
                            </div>
                            {item.updatedBy && (
                              <div className="flex items-center">
                                <User className="mr-1 h-3 w-3" />
                                {item.updatedBy}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {plans.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Management Plans Yet</h3>
            <p className="text-muted-foreground mb-6">
              Generate comprehensive management plans for your project including quality,
              environmental, safety, and traffic management procedures.
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={() => generatePlan('pqp')}>
                <Shield className="mr-2 h-4 w-4" />
                Generate Quality Plan
              </Button>
              <Button variant="outline" onClick={() => generatePlan('ohsmp')}>
                <HardHat className="mr-2 h-4 w-4" />
                Generate Safety Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
