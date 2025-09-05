'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { CheckCircle, AlertTriangle, Clock, FileText, Eye, Download, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface WorkLot {
  id: string
  lotNumber: string
  name: string
  status: 'planned' | 'active' | 'completed' | 'on_hold'
  itpDocumentAssetId: string
  lbsNodeAssetId: string
  qualityRisks: string[]
  testMatrix: string[]
  evidenceGaps: string[]
  inspectionPoints: Array<{
    inspectionPointId: string
    code: string
    title: string
    pointType: 'hold' | 'witness' | 'surveillance' | 'record'
    slaDueAt: string
    notifiedAt?: string
    releasedAt?: string
    approvalState: 'not_required' | 'pending_review' | 'approved' | 'rejected'
  }>
  testResults: Array<{
    testMethodCode: string
    passFail: 'pass' | 'fail' | 'pending'
    reportDate: string
  }>
  createdAt: string
  updatedAt: string
}

interface WorkLotRegisterProps {
  lots?: WorkLot[]
  projectId?: string
}

export default function WorkLotRegister({ lots: initialLots, projectId: propProjectId }: WorkLotRegisterProps) {
  const params = useParams()
  const projectId = propProjectId || params.projectId as string

  const [lots, setLots] = useState<WorkLot[]>(initialLots || [])
  const [loading, setLoading] = useState(!initialLots)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedLot, setSelectedLot] = useState<WorkLot | null>(null)

  useEffect(() => {
    if (!initialLots && projectId) {
      fetchLots()
    }
  }, [projectId, initialLots])

  const fetchLots = async () => {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/quality/lots`)
      if (response.ok) {
        const data = await response.json()
        setLots(data.lots || [])
      }
    } catch (error) {
      console.error('Error fetching work lots:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLots = lots.filter(lot => {
    const matchesSearch = lot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lot.lotNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || lot.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const variants = {
      planned: 'secondary',
      active: 'default',
      completed: 'outline',
      on_hold: 'destructive',
    } as const

    const labels = {
      planned: 'Planned',
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

  const getInspectionPointBadge = (pointType: string) => {
    const variants = {
      hold: 'destructive',
      witness: 'default',
      surveillance: 'secondary',
      record: 'outline',
    } as const

    return (
      <Badge variant={variants[pointType as keyof typeof variants]} className="text-xs">
        {pointType}
      </Badge>
    )
  }

  const getApprovalBadge = (state: string) => {
    const variants = {
      not_required: 'outline',
      pending_review: 'secondary',
      approved: 'default',
      rejected: 'destructive',
    } as const

    const labels = {
      not_required: 'N/A',
      pending_review: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
    }

    return (
      <Badge variant={variants[state as keyof typeof variants]} className="text-xs">
        {labels[state as keyof typeof labels]}
      </Badge>
    )
  }

  const getCompletionStatus = (lot: WorkLot) => {
    const totalPoints = lot.inspectionPoints.length
    const approvedPoints = lot.inspectionPoints.filter(p => p.approvalState === 'approved').length
    const rejectedPoints = lot.inspectionPoints.filter(p => p.approvalState === 'rejected').length
    const pendingPoints = lot.inspectionPoints.filter(p => p.approvalState === 'pending_review').length

    if (rejectedPoints > 0) return { status: 'blocked', color: 'text-red-600' }
    if (pendingPoints > 0) return { status: 'pending', color: 'text-yellow-600' }
    if (approvedPoints === totalPoints) return { status: 'ready', color: 'text-green-600' }
    return { status: 'in_progress', color: 'text-blue-600' }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Work Lot Register</h1>
          <p className="text-gray-600 mt-2">Quality-controlled work packages with inspection gating</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            Create Lot
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lots</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lots.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {lots.filter(l => l.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {lots.filter(l => l.status === 'completed').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {lots.filter(l => getCompletionStatus(l).status === 'blocked').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search lots..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="planned">Planned</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Work Lots Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lot Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Quality Gate</TableHead>
                <TableHead>Inspection Points</TableHead>
                <TableHead>Test Results</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLots.map((lot) => {
                const completionStatus = getCompletionStatus(lot)
                return (
                  <TableRow key={lot.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{lot.name}</div>
                        <div className="text-sm text-gray-600">Lot #{lot.lotNumber}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Created: {new Date(lot.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(lot.status)}
                        <div className={`text-xs font-medium ${completionStatus.color}`}>
                          {completionStatus.status}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {lot.qualityRisks.slice(0, 2).map((risk, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {risk}
                          </Badge>
                        ))}
                        {lot.qualityRisks.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{lot.qualityRisks.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="text-sm font-medium">
                          {lot.inspectionPoints.filter(p => p.approvalState === 'approved').length} / {lot.inspectionPoints.length} approved
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {lot.inspectionPoints.slice(0, 3).map((point, index) => (
                            <div key={index} className="flex items-center gap-1">
                              {getInspectionPointBadge(point.pointType)}
                              {getApprovalBadge(point.approvalState)}
                            </div>
                          ))}
                          {lot.inspectionPoints.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{lot.inspectionPoints.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {lot.testResults.map((result, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs">
                            <Badge
                              variant={result.passFail === 'pass' ? 'default' : result.passFail === 'fail' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {result.testMethodCode}
                            </Badge>
                            <span className="text-gray-600">{result.passFail}</span>
                          </div>
                        ))}
                        {lot.testResults.length === 0 && (
                          <span className="text-gray-500 text-xs">No tests yet</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedLot(lot)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {filteredLots.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No work lots found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Create your first work lot to get started'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button>
                  <FileText className="w-4 h-4 mr-2" />
                  Create First Lot
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lot Detail Modal */}
      {selectedLot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedLot.name}</h2>
                  <p className="text-gray-600">Lot #{selectedLot.lotNumber}</p>
                </div>
                <div className="flex gap-2">
                  {getStatusBadge(selectedLot.status)}
                  <Button
                    variant="outline"
                    onClick={() => setSelectedLot(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Quality Risks */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Quality Risks</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedLot.qualityRisks.map((risk, index) => (
                    <Badge key={index} variant="destructive">
                      {risk}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Inspection Points */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Inspection Points</h3>
                <div className="space-y-3">
                  {selectedLot.inspectionPoints.map((point, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{point.title}</div>
                          <div className="text-sm text-gray-600">{point.code}</div>
                        </div>
                        <div className="flex gap-2">
                          {getInspectionPointBadge(point.pointType)}
                          {getApprovalBadge(point.approvalState)}
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        SLA Due: {new Date(point.slaDueAt).toLocaleString()}
                        {point.notifiedAt && ` | Notified: ${new Date(point.notifiedAt).toLocaleString()}`}
                        {point.releasedAt && ` | Released: ${new Date(point.releasedAt).toLocaleString()}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Test Results */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Test Results</h3>
                {selectedLot.testResults.length > 0 ? (
                  <div className="space-y-2">
                    {selectedLot.testResults.map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium">{result.testMethodCode}</div>
                          <div className="text-sm text-gray-600">
                            Reported: {new Date(result.reportDate).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge
                          variant={result.passFail === 'pass' ? 'default' : result.passFail === 'fail' ? 'destructive' : 'secondary'}
                        >
                          {result.passFail.toUpperCase()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No test results available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}