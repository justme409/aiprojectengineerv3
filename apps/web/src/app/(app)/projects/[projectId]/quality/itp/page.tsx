'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

interface ITPItem {
  itp_asset_id: string
  organization_id: string
  project_id: string
  version: number
  approval_state: string
  approvals: any[]
  jurisdiction_coverage_status: string
  required_points_present: string
  name?: string
  created_at: string
}

export default function ITPRegisterPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const [itpItems, setItpItems] = useState<ITPItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<ITPItem | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [action, setAction] = useState('')

  const fetchITPItems = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/quality/itp`)
      const data = await response.json()
      setItpItems(data.data || [])
    } catch (error) {
      console.error('Error fetching ITP items:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchITPItems()
  }, [fetchITPItems])

  const handleAction = async (item: ITPItem, actionType: string) => {
    setSelectedItem(item)
    setAction(actionType)
    setDialogOpen(true)
  }

  const submitAction = async (formData: FormData) => {
    if (!selectedItem) return

    const data = {
      itp_asset_id: selectedItem.itp_asset_id,
      action,
      ...Object.fromEntries(formData)
    }

    try {
      const response = await fetch(`/api/v1/projects/${projectId}/quality/itp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        setDialogOpen(false)
        fetchITPItems() // Refresh data
      }
    } catch (error) {
      console.error('Error submitting action:', error)
    }
  }

  const getStatusBadge = (item: ITPItem) => {
    switch (item.approval_state) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case 'pending_review':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="secondary">Draft</Badge>
    }
  }

  const getCoverageStatus = (item: ITPItem) => {
    const coverage = item.jurisdiction_coverage_status
    const pointsPresent = item.required_points_present

    if (coverage === 'complete' && pointsPresent === 'true') {
      return <Badge className="bg-green-100 text-green-800">Complete</Badge>
    } else if (coverage === 'partial' || pointsPresent === 'false') {
      return <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-800">Incomplete</Badge>
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">ITP Register</h1>
        <div className="flex gap-2">
          <Button variant="outline">Export Register</Button>
          <Button variant="outline">Import ITP</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total ITPs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{itpItems.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {itpItems.filter(item => item.approval_state === 'approved').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {itpItems.filter(item => item.approval_state === 'pending_review').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ITP Documents & Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Coverage</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Approvals</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itpItems.map((item) => (
                <TableRow key={item.itp_asset_id}>
                  <TableCell className="font-medium">
                    {item.name || `ITP ${item.itp_asset_id.slice(-8)}`}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {item.itp_asset_id.includes('template') ? 'Template' : 'Document'}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(item)}</TableCell>
                  <TableCell>{getCoverageStatus(item)}</TableCell>
                  <TableCell>v{item.version}</TableCell>
                  <TableCell>
                    {item.approvals && item.approvals.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {item.approvals.slice(0, 2).map((approval, idx) => (
                          <div key={idx} className="text-xs">
                            {approval.user_or_role} - {new Date(approval.approved_at).toLocaleDateString()}
                          </div>
                        ))}
                        {item.approvals.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{item.approvals.length - 2} more
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(item, 'check_coverage')}
                      >
                        Check Coverage
                      </Button>
                      {item.approval_state !== 'approved' && (
                        <Button
                          size="sm"
                          onClick={() => handleAction(item, 'endorse_itp')}
                        >
                          Endorse
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'endorse_itp' && 'Endorse ITP'}
              {action === 'check_coverage' && 'Coverage Check'}
            </DialogTitle>
          </DialogHeader>
          {action === 'endorse_itp' && (
            <form action={submitAction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Role at Endorsement</label>
                <Select name="role_at_endorsement">
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Designer">Designer</SelectItem>
                    <SelectItem value="Engineer">Engineer</SelectItem>
                    <SelectItem value="Quality Manager">Quality Manager</SelectItem>
                    <SelectItem value="Project Manager">Project Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Endorsement Notes</label>
                <textarea
                  name="endorsement_notes"
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  placeholder="Optional notes..."
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Endorse ITP</Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
          {action === 'check_coverage' && (
            <div className="space-y-4">
              <p>Checking ITP coverage against jurisdiction requirements...</p>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm">Coverage check will be performed and results displayed here.</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => submitAction(new FormData())}>
                  Run Coverage Check
                </Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
