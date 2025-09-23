'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  Eye,
  Plus
} from 'lucide-react'

interface ITPDocument {
  id: string
  name: string
  documentNumber: string | null
  templateDocumentNumber: string | null
  revision: string | null
  status: 'draft' | 'pending_review' | 'approved' | 'superseded'
  approvalState: 'not_required' | 'pending_review' | 'approved' | 'rejected' | 'changes_requested'
}

// Removed stats UI; keep no client stats state

export default function ITPRegisterPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const [documents, setDocuments] = useState<ITPDocument[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<ITPDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')

  useEffect(() => {
    const fetchITPDocuments = async () => {
      try {
        setLoading(true)
        // Use dedicated register API that returns both itp_document and itp_template
        const response = await fetch(`/api/v1/projects/${projectId}/quality/itp-register`)
        if (response.ok) {
          const data = await response.json()
          const rows = (data.itpRegister || []) as any[]
          const transformed = transformAssetsToITPDocs(rows)
          setDocuments(transformed)
        } else {
          console.error('API response not ok:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('Error fetching ITP documents:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchITPDocuments()
  }, [projectId])

  useEffect(() => {
    const filterAndSortDocuments = () => {
      let filtered = documents

      // Apply search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        filtered = filtered.filter(doc =>
          (doc.name || '').toLowerCase().includes(term) ||
          (doc.documentNumber || '').toLowerCase().includes(term) ||
          (doc.templateDocumentNumber || '').toLowerCase().includes(term)
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
            return (a.name || '').localeCompare(b.name || '')
          case 'status':
            return (a.approvalState || '').localeCompare(b.approvalState || '')
          case 'template':
            return (a.templateDocumentNumber || '').localeCompare(b.templateDocumentNumber || '')
          case 'revision':
            return (a.revision || '').localeCompare(b.revision || '')
          default:
            return (a.name || '').localeCompare(b.name || '')
        }
      })

      setFilteredDocuments(filtered)
    }

    filterAndSortDocuments()
  }, [documents, searchTerm, statusFilter, sortBy])


  const transformAssetsToITPDocs = (assets: any[]): ITPDocument[] => {
    return assets.map(asset => ({
      id: asset.id,
      name: asset.name,
      documentNumber: asset.document_number ?? null,
      templateDocumentNumber: asset.template_document_number ?? asset.content?.template_document_number ?? null,
      revision: asset.revision_code ?? null,
      status: asset.status,
      approvalState: asset.approval_state,
    }))
  }

  // Removed stats calculation


  const getStatusText = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Draft',
      pending_review: 'Pending Review',
      approved: 'Approved',
      rejected: 'Rejected',
      superseded: 'Superseded',
      not_required: 'Not Required'
    }
    return labels[status] || status
  }

  // Removed progress bar UI

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
          <Link href={`/projects/${projectId}/quality/itp-templates`}>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              New ITP
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats removed; keeping only header and filters */}

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
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ITP Name</TableHead>
                <TableHead>ITP Number</TableHead>
                <TableHead>Revision</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.name}</TableCell>
                  <TableCell>{doc.documentNumber || '-'}</TableCell>
                  <TableCell>{doc.revision || '-'}</TableCell>
                  <TableCell>{getStatusText(doc.approvalState)}</TableCell>
                  <TableCell>
                    <Link href={`/projects/${projectId}/quality/itp/${doc.id}`}>
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
