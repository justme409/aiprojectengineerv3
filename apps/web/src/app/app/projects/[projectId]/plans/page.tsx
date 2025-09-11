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
  description?: string
  type?: string
  status?: 'draft' | 'approved' | 'pending_review'
  lastUpdated?: string
  updatedBy?: string
  documentCount?: number
  item_no?: string
  label?: string
  content?: string | any
  content_type?: string
  parentId?: string
  thinking?: string
  url?: string
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
  const [viewingPlan, setViewingPlan] = useState<ManagementPlan | null>(null)

  useEffect(() => {
    fetchPlans()
  }, [projectId])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      // Fetch existing plans from assets
      const response = await fetch(`/api/v1/assets?projectId=${projectId}&type=plan`)
      if (response.ok) {
        const data = await response.json()
        console.log('API Response:', data)
        // Transform assets into management plans format
        const transformedPlans = transformAssetsToPlans(data.assets || [])
        console.log('Transformed plans:', transformedPlans)
        setPlans(transformedPlans)
      } else {
        console.error('API response not ok:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const transformAssetsToPlans = (assets: any[]): ManagementPlan[] => {
    const plans: ManagementPlan[] = []

    assets.forEach(asset => {
      // Handle management_plans asset (contains multiple plan types)
      if (asset.subtype === 'management_plans' && asset.content?.plans) {
        asset.content.plans.forEach((planData: any) => {
          const planType = planData.plan_type
          console.log(`Processing ${planType} plan:`, planData.plan_name, planData.plan_items?.length || 0, 'items')
          plans.push({
            id: `${planType}-${projectId}`,
            type: planType as 'pqp' | 'emp' | 'ohsmp' | 'tmp',
            title: planTypes[planType as keyof typeof planTypes]?.title || `${planType.toUpperCase()} Plan`,
            description: planTypes[planType as keyof typeof planTypes]?.description || planData.plan_name || '',
            status: asset.status || 'draft',
            generatedAt: asset.created_at,
            items: planData.plan_items || []
          })
        })
      }
      // Handle individual plan assets
      else if (asset.type === 'plan' && asset.subtype !== 'management_plans') {
        const planType = asset.subtype === 'wbs' ? 'pqp' : asset.subtype || 'pqp'
        plans.push({
          id: asset.id,
          type: planType as 'pqp' | 'emp' | 'ohsmp' | 'tmp',
          title: asset.name,
          description: asset.content?.description || planTypes[planType as keyof typeof planTypes]?.description || '',
          status: asset.status || 'draft',
          generatedAt: asset.created_at,
          items: asset.content?.items || asset.content?.sections || []
        })
      }
    })

    console.log('Final plans array:', plans.map(p => ({ type: p.type, title: p.title, items: p.items.length })))
    return plans
  }

  const viewPlan = (plan: ManagementPlan) => {
    setViewingPlan(plan)
    setSelectedPlanType(plan.type)
  }

  const generatePlan = async (planType: string) => {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/ai/plan-generation`, {
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
          console.log(`Rendering ${type} plan card:`, plan ? `Found with ${plan.items.length} items` : 'NOT FOUND')
          console.log(`Available plans:`, plans.map(p => p.type))
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => viewPlan(plan)}
                      >
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
      {viewingPlan && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{viewingPlan.title}</CardTitle>
                <CardDescription>
                  Detailed view of plan sections and requirements
                </CardDescription>
              </div>
              <Button variant="outline" onClick={() => setViewingPlan(null)}>
                Back to Overview
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Plan Overview */}
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Plan Overview</h3>
                <p className="text-sm text-muted-foreground mb-4">{viewingPlan.description}</p>
                <div className="flex gap-4 text-sm">
                  <div><strong>Status:</strong> {getStatusBadge(viewingPlan.status)}</div>
                  <div><strong>Generated:</strong> {new Date(viewingPlan.generatedAt).toLocaleDateString()}</div>
                  <div><strong>Sections:</strong> {viewingPlan.items.length}</div>
                </div>
              </div>

              {/* Plan Sections */}
              <div>
                <h3 className="font-semibold mb-4">Plan Sections</h3>
                <div className="space-y-4">
                  {viewingPlan.items.map((item, index) => (
                    <Card key={item.id || index}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            {item.item_no ? `${item.item_no} - ` : ''}{item.title}
                          </CardTitle>
                          {item.content_type && (
                            <Badge variant="outline" className="text-xs">
                              {item.content_type}
                            </Badge>
                          )}
                        </div>
                        {item.label && (
                          <CardDescription className="text-xs text-blue-600">
                            {item.label}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        {item.content && (
                          <div className="text-sm text-muted-foreground mb-3">
                            {typeof item.content === 'string' ?
                              item.content.length > 300 ?
                                `${item.content.substring(0, 300)}...` :
                                item.content
                              : JSON.stringify(item.content, null, 2)
                            }
                          </div>
                        )}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div>ID: {item.id}</div>
                          {item.parentId && <div>Parent: {item.parentId}</div>}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Navigation Tabs (when not viewing a specific plan) */}
      {!viewingPlan && plans.length > 0 && (
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
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Click &quot;View&quot; on the plan above to see detailed sections and requirements.
                    </p>
                    <Button onClick={() => viewPlan(plan)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View {planTypes[plan.type]?.title}
                    </Button>
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

