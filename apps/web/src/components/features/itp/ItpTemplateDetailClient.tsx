'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { ArrowLeft, FileText, Eye } from 'lucide-react'

interface ITPItem {
  id: string
  code: string
  title: string
  description: string
  pointType: 'hold' | 'witness' | 'surveillance' | 'record'
  acceptanceCriteria: string
  requiredRecords: string[]
  slaHours: number
  jurisdictionRules: string[]
}

interface ITPTemplate {
  id: string
  name: string
  description: string
  version: string
  status: 'draft' | 'approved' | 'superseded'
  items?: ITPItem[]
  applicabilityNotes?: string
  createdAt: string
  updatedAt: string
}

interface Lot {
  id: string
  name: string
  lot_number?: string
  status: string
  description?: string
  itp_document_asset_id?: string
  lbs_node_asset_id?: string
  created_at: string
  updated_at: string
}

interface ItpTemplateDetailClientProps {
  template?: ITPTemplate | null
  lot?: Lot | null
  projectId: string
  lotId?: string
  templateId?: string
  projectName: string
  isClientPortal?: boolean
}

export default function ItpTemplateDetailClient({
  template,
  lot,
  projectId,
  lotId,
  templateId,
  projectName,
  isClientPortal = false
}: ItpTemplateDetailClientProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      approved: 'default',
      superseded: 'outline',
      active: 'default',
      completed: 'default'
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    )
  }

  const getPointTypeBadge = (pointType: string) => {
    const variants = {
      hold: 'destructive',
      witness: 'default',
      surveillance: 'secondary',
      record: 'outline'
    } as const

    return (
      <Badge variant={variants[pointType as keyof typeof variants] || 'outline'}>
        {pointType}
      </Badge>
    )
  }

  if (lot && !template) {
    // Display lot information when no template is associated
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href={isClientPortal ? `/portal/projects/${projectId}/lots` : `/app/projects/${projectId}/lots`}
              className="text-sm text-muted-foreground hover:underline flex items-center mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Lots for {projectName}
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Lot: {lot.name || lot.lot_number}
            </h1>
            <p className="text-gray-600 mt-2">
              Lot details and associated quality control items.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{lot.name || `Lot ${lot.lot_number}`}</CardTitle>
              <div className="flex items-center space-x-2 pt-1">
                {getStatusBadge(lot.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <p><strong>Project:</strong> {projectName}</p>
                  <p><strong>Lot Number:</strong> {lot.lot_number || 'N/A'}</p>
                  <p><strong>Status:</strong> {lot.status}</p>
                  <p><strong>Created:</strong> {formatDate(lot.created_at)}</p>
                  <p><strong>LBS Node:</strong> {lot.lbs_node_asset_id || 'N/A'}</p>
                  <p><strong>Last Updated:</strong> {formatDate(lot.updated_at)}</p>
                </div>
              </div>

              {lot.description && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {lot.description}
                    </p>
                  </div>
                </>
              )}

              <Separator />
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No ITP Template Associated</h3>
                <p className="text-muted-foreground mb-4">
                  This lot doesn&apos;t have an associated ITP template yet.
                </p>
                {!isClientPortal && (
                  <Button asChild>
                    <Link href={`/app/projects/${projectId}/quality/itp-templates`}>
                      Browse ITP Templates
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Template Not Found</h3>
            <p className="text-muted-foreground">
              The requested ITP template could not be found.
            </p>
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
          <Link
            href={isClientPortal ? `/portal/projects/${projectId}/itp-templates` : `/app/projects/${projectId}/quality/itp-templates`}
            className="text-sm text-muted-foreground hover:underline flex items-center mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to ITP Templates for {projectName}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {template.name} {template.version && `(v${template.version})`}
          </h1>
          <p className="text-gray-600 mt-2">
            ITP template details and inspection/test plan items.
          </p>
        </div>

        <div className="space-y-6">
          {/* Template Overview */}
          <Card>
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
              <div className="flex items-center space-x-2 pt-1">
                {getStatusBadge(template.status)}
                {template.version && (
                  <Badge variant="outline">Version {template.version}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <p><strong>Project:</strong> {projectName}</p>
                  <p><strong>Status:</strong> {template.status}</p>
                  <p><strong>Created:</strong> {formatDate(template.createdAt)}</p>
                  <p><strong>Last Updated:</strong> {formatDate(template.updatedAt)}</p>
                </div>
              </div>

              {template.description && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {template.description}
                    </p>
                  </div>
                </>
              )}

              {template.applicabilityNotes && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Applicability Notes</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {template.applicabilityNotes}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* ITP Items */}
          {template.items && template.items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Inspection and Test Plan Items</CardTitle>
                <CardDescription>
                  {template.items.length} items in this ITP template
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>SLA (Hours)</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {template.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.code}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.title}</div>
                            {item.description && (
                              <div className="text-sm text-muted-foreground line-clamp-2">
                                {item.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getPointTypeBadge(item.pointType)}
                        </TableCell>
                        <TableCell>{item.slaHours || 'N/A'}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-3 w-3" />
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Associated Lot Information */}
          {lot && (
            <Card>
              <CardHeader>
                <CardTitle>Associated Lot</CardTitle>
                <CardDescription>
                  This template is associated with the following lot
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{lot.name || `Lot ${lot.lot_number}`}</h4>
                    <p className="text-sm text-muted-foreground">
                      Status: {getStatusBadge(lot.status)}
                    </p>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href={`/app/projects/${projectId}/lots/${lot.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Lot Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
