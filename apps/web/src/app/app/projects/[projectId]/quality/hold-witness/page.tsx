'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface InspectionPoint {
  inspection_point_id: string
  code: string
  title: string
  point_type: string
  itp_item_ref: string
  notified_at: string | null
  released_at: string | null
  sla_due_at: string
  approval_state: string
}

export default function HoldWitnessPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const [inspectionPoints, setInspectionPoints] = useState<InspectionPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPoint, setSelectedPoint] = useState<InspectionPoint | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [action, setAction] = useState('')

  useEffect(() => {
    fetchInspectionPoints()
  }, [projectId])

  const fetchInspectionPoints = async () => {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/quality/hold-witness`)
      const data = await response.json()
      setInspectionPoints(data.data || [])
    } catch (error) {
      console.error('Error fetching inspection points:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (point: InspectionPoint, actionType: string) => {
    setSelectedPoint(point)
    setAction(actionType)
    setDialogOpen(true)
  }

  const submitAction = async (formData: FormData) => {
    if (!selectedPoint) return

    const data = {
      inspection_point_id: selectedPoint.inspection_point_id,
      action,
      ...Object.fromEntries(formData)
    }

    try {
      const response = await fetch(`/api/v1/projects/${projectId}/quality/hold-witness`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        setDialogOpen(false)
        fetchInspectionPoints() // Refresh data
      }
    } catch (error) {
      console.error('Error submitting action:', error)
    }
  }

  const getStatusBadge = (point: InspectionPoint) => {
    if (point.released_at) return <Badge variant="secondary">Released</Badge>
    if (point.notified_at) return <Badge variant="outline">Notified</Badge>
    return <Badge variant="destructive">Pending</Badge>
  }

  const isOverdue = (slaDueAt: string) => {
    return new Date(slaDueAt) < new Date()
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Hold & Witness Register</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add Inspection Point</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Inspection Point</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div>
                <Label htmlFor="code">Code</Label>
                <Input id="code" name="code" required />
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" required />
              </div>
              <div>
                <Label htmlFor="point_type">Point Type</Label>
                <Select name="point_type">
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hold">Hold Point</SelectItem>
                    <SelectItem value="witness">Witness Point</SelectItem>
                    <SelectItem value="surveillance">Surveillance</SelectItem>
                    <SelectItem value="record">Record Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="itp_item_ref">ITP Item Reference</Label>
                <Input id="itp_item_ref" name="itp_item_ref" />
              </div>
              <div>
                <Label htmlFor="sla_due_at">SLA Due Date</Label>
                <Input id="sla_due_at" name="sla_due_at" type="datetime-local" />
              </div>
              <Button type="submit">Create</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inspection Points</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>SLA Due</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inspectionPoints.map((point) => (
                <TableRow key={point.inspection_point_id}>
                  <TableCell className="font-medium">{point.code}</TableCell>
                  <TableCell>{point.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{point.point_type}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(point)}</TableCell>
                  <TableCell className={isOverdue(point.sla_due_at) ? 'text-red-600' : ''}>
                    {new Date(point.sla_due_at).toLocaleDateString()}
                    {isOverdue(point.sla_due_at) && ' (Overdue)'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {!point.notified_at && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction(point, 'notify_witness')}
                        >
                          Notify
                        </Button>
                      )}
                      {!point.released_at && point.point_type === 'hold' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleAction(point, 'release_hold_point')}
                          >
                            Release
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAction(point, 'reject_hold_point')}
                          >
                            Reject
                          </Button>
                        </>
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
              {action === 'notify_witness' && 'Notify Witness Point'}
              {action === 'release_hold_point' && 'Release Hold Point'}
              {action === 'reject_hold_point' && 'Reject Hold Point'}
            </DialogTitle>
          </DialogHeader>
          <form action={submitAction} className="space-y-4">
            {action === 'release_hold_point' && (
              <div>
                <Label htmlFor="release_notes">Release Notes</Label>
                <Textarea id="release_notes" name="release_notes" />
              </div>
            )}
            {action === 'reject_hold_point' && (
              <div>
                <Label htmlFor="rejection_reason">Rejection Reason</Label>
                <Textarea id="rejection_reason" name="rejection_reason" required />
              </div>
            )}
            <div className="flex gap-2">
              <Button type="submit">
                {action === 'notify_witness' && 'Notify'}
                {action === 'release_hold_point' && 'Release'}
                {action === 'reject_hold_point' && 'Reject'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
