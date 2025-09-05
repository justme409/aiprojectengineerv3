'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Plus, FileText, AlertTriangle, Users, Calendar, CheckCircle, Clock, Eye, Edit, Download, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Swms {
  id: string
  title: string
  workActivity: string
  hazards: string[]
  controls: string[]
  rolesRequired: string[]
  expiryDate: string
  status: 'draft' | 'active' | 'expired' | 'superseded'
  approvalStatus: 'pending' | 'approved' | 'rejected'
  createdBy: string
  approvedBy?: string
  createdAt: string
  updatedAt: string
}

interface SwmsRegisterProps {
  swms?: Swms[]
  projectId?: string
}

export default function SwmsRegister({ swms: initialSwms, projectId: propProjectId }: SwmsRegisterProps) {
  const params = useParams()
  const projectId = propProjectId || params.projectId as string

  const [swms, setSwms] = useState<Swms[]>(initialSwms || [])
  const [loading, setLoading] = useState(!initialSwms)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedSwms, setSelectedSwms] = useState<Swms | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  useEffect(() => {
    if (!initialSwms && projectId) {
      fetchSwms()
    }
  }, [projectId, initialSwms])

  const fetchSwms = async () => {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/hse/swms`)
      if (response.ok) {
        const data = await response.json()
        setSwms(data.swms || [])
      }
    } catch (error) {
      console.error('Error fetching SWMS:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSwms = swms.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.workActivity.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      superseded: 'bg-gray-100 text-gray-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getApprovalBadge = (status: string) => {
    const colors = {
      pending: 'bg-orange-100 text-orange-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date()
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SWMS Register</h1>
          <p className="text-gray-600 mt-2">Safe Work Method Statements</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create SWMS
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total SWMS</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{swms.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {swms.filter(s => s.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {swms.filter(s => isExpiringSoon(s.expiryDate)).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {swms.filter(s => isExpired(s.expiryDate)).length}
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
                  placeholder="Search SWMS..."
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
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="superseded">Superseded</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SWMS Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SWMS Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Hazards</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSwms.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{item.title}</div>
                      <div className="text-sm text-gray-600">{item.workActivity}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Users className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {item.rolesRequired.join(', ')}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge className={getStatusBadge(item.status)}>
                        {item.status}
                      </Badge>
                      <Badge className={getApprovalBadge(item.approvalStatus)}>
                        {item.approvalStatus}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className={`text-sm ${isExpired(item.expiryDate) ? 'text-red-600 font-medium' : isExpiringSoon(item.expiryDate) ? 'text-orange-600 font-medium' : 'text-gray-900'}`}>
                        {new Date(item.expiryDate).toLocaleDateString()}
                      </span>
                      {isExpired(item.expiryDate) && (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      )}
                      {isExpiringSoon(item.expiryDate) && !isExpired(item.expiryDate) && (
                        <Clock className="w-4 h-4 text-orange-600" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {item.hazards.slice(0, 2).map((hazard, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {hazard}
                        </Badge>
                      ))}
                      {item.hazards.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{item.hazards.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSwms(item)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredSwms.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No SWMS Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Create your first Safe Work Method Statement'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First SWMS
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* SWMS Detail Modal */}
      {selectedSwms && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedSwms.title}</h2>
                  <p className="text-gray-600">{selectedSwms.workActivity}</p>
                </div>
                <div className="flex gap-2">
                  <Badge className={getStatusBadge(selectedSwms.status)}>
                    {selectedSwms.status}
                  </Badge>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedSwms(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Required Roles</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedSwms.rolesRequired.map((role, index) => (
                    <Badge key={index} variant="secondary">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Identified Hazards</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedSwms.hazards.map((hazard, index) => (
                    <div key={index} className="p-3 bg-red-50 border border-red-200 rounded">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">{hazard}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Control Measures</h3>
                <div className="space-y-2">
                  {selectedSwms.controls.map((control, index) => (
                    <div key={index} className="p-3 bg-green-50 border border-green-200 rounded">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-800">{control}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Expiry Date</h4>
                  <p className="text-gray-600">{new Date(selectedSwms.expiryDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Created By</h4>
                  <p className="text-gray-600">{selectedSwms.createdBy}</p>
                </div>
                {selectedSwms.approvedBy && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Approved By</h4>
                    <p className="text-gray-600">{selectedSwms.approvedBy}</p>
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Last Updated</h4>
                  <p className="text-gray-600">{new Date(selectedSwms.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
