'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, CheckCircle, Clock } from 'lucide-react'

interface RecordItem {
  asset_id: string
  name: string
  type: string
  subtype: string | null
  status: string
  approval_state: string
  records_identified: any
  created_at: string
}

export default function RecordsHandoverPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const [recordItems, setRecordItems] = useState<RecordItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<RecordItem | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [action, setAction] = useState('')

  const fetchRecordItems = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/quality/records`)
      const data = await response.json()
      setRecordItems(data.data || [])
    } catch (error) {
      console.error('Error fetching record items:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchRecordItems()
  }, [fetchRecordItems])

  const handleAction = async (item: RecordItem, actionType: string) => {
    setSelectedItem(item)
    setAction(actionType)
    setDialogOpen(true)
  }

  const submitAction = async (formData: FormData) => {
    if (!selectedItem) return

    const data = {
      asset_id: selectedItem.asset_id,
      action,
      ...Object.fromEntries(formData)
    }

    try {
      const response = await fetch(`/api/v1/projects/${projectId}/quality/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        setDialogOpen(false)
        fetchRecordItems() // Refresh data
      }
    } catch (error) {
      console.error('Error submitting action:', error)
    }
  }

  const getStatusBadge = (item: RecordItem) => {
    const records = item.records_identified
    if (!records || records.length === 0) {
      return <Badge variant="secondary">Not Identified</Badge>
    }

    const delivered = records.some((r: any) => r.delivered === true)
    if (delivered) {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Delivered</Badge>
    }

    return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Identified</Badge>
  }

  const getRecordCount = (item: RecordItem) => {
    if (!item.records_identified) return 0
    return Array.isArray(item.records_identified) ? item.records_identified.length : 0
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Records Handover Dashboard</h1>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Create RMP</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Records Management Plan</DialogTitle>
              </DialogHeader>
              <form action={(formData) => submitAction(formData)} className="space-y-4">
                <input type="hidden" name="action" value="create_rmp" />
                <div>
                  <Label htmlFor="title">Plan Title</Label>
                  <Input id="title" name="title" required />
                </div>
                <div>
                  <Label htmlFor="scope">Scope</Label>
                  <Textarea id="scope" name="scope" placeholder="Describe the scope of this RMP..." />
                </div>
                <div>
                  <Label htmlFor="records_schedule">Records Schedule</Label>
                  <Textarea id="records_schedule" name="records_schedule" placeholder="List the records and their retention periods..." />
                </div>
                <div>
                  <Label htmlFor="retention_periods">Retention Periods</Label>
                  <Textarea id="retention_periods" name="retention_periods" placeholder="Specify retention periods for different record types..." />
                </div>
                <div>
                  <Label htmlFor="disposal_methods">Disposal Methods</Label>
                  <Textarea id="disposal_methods" name="disposal_methods" placeholder="Describe disposal methods..." />
                </div>
                <Button type="submit">Create RMP</Button>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="outline">Export Status Report</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Total Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recordItems.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Records Identified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {recordItems.reduce((sum, item) => sum + getRecordCount(item), 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {recordItems.filter(item => {
                const records = item.records_identified
                return records && records.some((r: any) => r.delivered === true)
              }).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {recordItems.filter(item => {
                const records = item.records_identified
                return !records || records.length === 0 || records.every((r: any) => !r.delivered)
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Identified Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Records Count</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recordItems.map((item) => (
                <TableRow key={item.asset_id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.type}</Badge>
                    {item.subtype && <Badge variant="secondary" className="ml-1">{item.subtype}</Badge>}
                  </TableCell>
                  <TableCell>{getRecordCount(item)}</TableCell>
                  <TableCell>{getStatusBadge(item)}</TableCell>
                  <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(item, 'mark_delivered')}
                      >
                        Mark Delivered
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(item, 'update_identified_records')}
                      >
                        Update Records
                      </Button>
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
              {action === 'mark_delivered' && 'Mark Records as Delivered'}
              {action === 'update_identified_records' && 'Update Identified Records'}
            </DialogTitle>
          </DialogHeader>
          <form action={submitAction} className="space-y-4">
            <input type="hidden" name="action" value={action} />

            {action === 'mark_delivered' && (
              <>
                <div>
                  <Label htmlFor="delivered_to">Delivered To</Label>
                  <Input id="delivered_to" name="delivered_to" required />
                </div>
                <div>
                  <Label htmlFor="delivery_method">Delivery Method</Label>
                  <Select name="delivery_method">
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="physical">Physical Delivery</SelectItem>
                      <SelectItem value="digital">Digital Transfer</SelectItem>
                      <SelectItem value="portal">Client Portal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="delivery_reference">Delivery Reference</Label>
                  <Input id="delivery_reference" name="delivery_reference" placeholder="Reference number, email ID, etc." />
                </div>
                <div>
                  <Label htmlFor="records_type">Records Type</Label>
                  <Input id="records_type" name="records_type" placeholder="e.g., As-Built Records, Test Certificates" />
                </div>
              </>
            )}

            {action === 'update_identified_records' && (
              <>
                <div>
                  <Label htmlFor="records_identified">Identified Records (JSON)</Label>
                  <Textarea
                    id="records_identified"
                    name="records_identified"
                    rows={6}
                    placeholder='[{"name": "Record 1", "type": "certificate", "required": true}, ...]'
                  />
                </div>
                <div>
                  <Label htmlFor="updated_by">Updated By</Label>
                  <Input id="updated_by" name="updated_by" required />
                </div>
              </>
            )}

            <div className="flex gap-2">
              <Button type="submit">
                {action === 'mark_delivered' && 'Mark as Delivered'}
                {action === 'update_identified_records' && 'Update Records'}
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
