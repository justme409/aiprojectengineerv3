'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  FileText,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Eye,
  Plus
} from 'lucide-react'

interface ITPDocument {
  id: string
  name: string
  documentNumber: string
  revision: string
  status: 'draft' | 'pending_review' | 'approved' | 'superseded'
  approvalState: 'not_required' | 'pending_review' | 'approved' | 'rejected' | 'changes_requested'
  createdAt: string
  updatedAt: string
  wbsNode?: string
  lbsNode?: string
  itemCount: number
  completedItems: number
}

interface ITPStats {
  total: number
  approved: number
  pending: number
  draft: number
  completionRate: number
}

export default function ITPRegisterPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const [documents, setDocuments] = useState<ITPDocument[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<ITPDocument[]>([])
  const [stats, setStats] = useState<ITPStats>({
    total: 0,
    approved: 0,
    pending: 0,
    draft: 0,
    completionRate: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('updated')

  useEffect(() => {
    fetchITPDocuments()
  }, [projectId])

  useEffect(() => {
    filterAndSortDocuments()
  }, [documents, searchTerm, statusFilter, sortBy])

  const fetchITPDocuments = async () => {
    try {
      setLoading(true)
      // Fetch ITP documents and templates from assets
      const response = await fetch(`/api/v1/assets?project_id=${projectId}&type=itp_document&type=itp_template`)
      if (response.ok) {
        const data = await response.json()
        const transformedDocs = transformAssetsToITPDocs(data.assets || [])
        setDocuments(transformedDocs)
        calculateStats(transformedDocs)
      }
    } catch (error) {
      console.error('Error fetching ITP documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const transformAssetsToITPDocs = (assets: any[]): ITPDocument[] => {
    return assets.map(asset => ({
      id: asset.id,
      name: asset.name,
      documentNumber: asset.document_number || 'N/A',
      revision: asset.revision_code || '1',
      status: asset.status,
      approvalState: asset.approval_state,
      createdAt: asset.created_at,
      updatedAt: asset.updated_at,
      wbsNode: asset.content?.wbs_node,
      lbsNode: asset.content?.lbs_node,
      itemCount: asset.content?.item_count || 0,
      completedItems: asset.content?.completed_items || 0
    }))
  }

  const calculateStats = (docs: ITPDocument[]) => {
    const total = docs.length
    const approved = docs.filter(doc => doc.approvalState === 'approved').length
    const pending = docs.filter(doc => doc.approvalState === 'pending_review').length
    const draft = docs.filter(doc => doc.status === 'draft').length
    const totalItems = docs.reduce((sum, doc) => sum + doc.itemCount, 0)
    const completedItems = docs.reduce((sum, doc) => sum + doc.completedItems, 0)
    const completionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

    setStats({
      total,
      approved,
      pending,
      draft,
      completionRate
    })
  }

  const filterAndSortDocuments = () => {
    let filtered = [...documents]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.documentNumber.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(doc => doc.approvalState === statusFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'status':
          return a.approvalState.localeCompare(b.approvalState)
        case 'updated':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
    })

    setFilteredDocuments(filtered)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      pending_review: 'outline',
      approved: 'default',
      rejected: 'destructive',
      superseded: 'secondary'
    } as const

    const labels = {
      draft: 'Draft',
      pending_review: 'Pending Review',
      approved: 'Approved',
      rejected: 'Rejected',
      superseded: 'Superseded'
    }

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    )
  }

  const getProgressBar = (completed: number, total: number) => {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <h1 className="text-3xl font-bold mb-8 h-8 bg-gray-200 rounded w-1/3"></h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">ITP Register</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive overview of all Inspection and Test Plans
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/app/projects/${projectId}/quality/itp-templates`}>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              New ITP
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total ITPs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <AlertTriangle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.completionRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search ITP documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending_review">Pending Review</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated">Last Updated</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* ITP Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>ITP Documents</CardTitle>
          <CardDescription>
            {filteredDocuments.length} of {documents.length} documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>WBS/LBS</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{doc.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {doc.documentNumber} (Rev {doc.revision})
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(doc.approvalState)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {doc.wbsNode && <div>WBS: {doc.wbsNode}</div>}
                      {doc.lbsNode && <div>LBS: {doc.lbsNode}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        {doc.completedItems}/{doc.itemCount} items
                      </div>
                      {getProgressBar(doc.completedItems, doc.itemCount)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {new Date(doc.updatedAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link href={`/app/projects/${projectId}/quality/itp/${doc.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-3 w-3" />
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No ITP Documents Found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Create your first ITP document to get started.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
