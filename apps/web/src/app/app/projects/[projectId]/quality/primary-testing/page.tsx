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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Flask, Calendar } from 'lucide-react'

interface PrimaryContract {
  id: string
  name: string
  content: any
  created_at: string
}

interface Lab {
  id: string
  name: string
  content: any
}

interface TestSchedule {
  id: string
  name: string
  content: any
  created_at: string
}

export default function PrimaryTestingPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const [contracts, setContracts] = useState<PrimaryContract[]>([])
  const [labs, setLabs] = useState<Lab[]>([])
  const [schedule, setSchedule] = useState<TestSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('contracts')

  useEffect(() => {
    fetchData()
  }, [projectId])

  const fetchData = async () => {
    try {
      const [contractsRes, labsRes, scheduleRes] = await Promise.all([
        fetch(`/api/v1/projects/${projectId}/quality/primary-testing?action=contracts`),
        fetch(`/api/v1/projects/${projectId}/quality/primary-testing?action=labs`),
        fetch(`/api/v1/projects/${projectId}/quality/primary-testing?action=schedule`)
      ])

      const [contractsData, labsData, scheduleData] = await Promise.all([
        contractsRes.json(),
        labsRes.json(),
        scheduleRes.json()
      ])

      setContracts(contractsData.data || [])
      setLabs(labsData.data || [])
      setSchedule(scheduleData.data || [])
    } catch (error) {
      console.error('Error fetching primary testing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const submitAction = async (formData: FormData) => {
    const data = {
      action: formData.get('action'),
      ...Object.fromEntries(formData)
    }

    try {
      const response = await fetch(`/api/v1/projects/${projectId}/quality/primary-testing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        setDialogOpen(false)
        fetchData() // Refresh data
      }
    } catch (error) {
      console.error('Error submitting action:', error)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Primary Testing (NSW)</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Contract</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Primary Testing Contract</DialogTitle>
            </DialogHeader>
            <form action={submitAction} className="space-y-4">
              <input type="hidden" name="action" value="create_contract" />
              <div>
                <Label htmlFor="contract_number">Contract Number</Label>
                <Input id="contract_number" name="contract_number" required />
              </div>
              <div>
                <Label htmlFor="contractor_name">Contractor Name</Label>
                <Input id="contractor_name" name="contractor_name" required />
              </div>
              <div>
                <Label htmlFor="lab_name">Lab Name</Label>
                <Input id="lab_name" name="lab_name" required />
              </div>
              <div>
                <Label htmlFor="scope_of_testing">Scope of Testing</Label>
                <Textarea id="scope_of_testing" name="scope_of_testing" rows={3} />
              </div>
              <div>
                <Label htmlFor="testing_frequency">Testing Frequency</Label>
                <Select name="testing_frequency">
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="as_required">As Required</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="contract_value">Contract Value ($)</Label>
                <Input id="contract_value" name="contract_value" type="number" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input id="start_date" name="start_date" type="date" />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input id="end_date" name="end_date" type="date" />
                </div>
              </div>
              <Button type="submit">Create Contract</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Active Contracts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contracts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Flask className="w-4 h-4" />
              Accredited Labs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{labs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Scheduled Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{schedule.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="labs">Labs</TabsTrigger>
          <TabsTrigger value="schedule">Test Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="contracts">
          <Card>
            <CardHeader>
              <CardTitle>Primary Testing Contracts</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract Number</TableHead>
                    <TableHead>Contractor</TableHead>
                    <TableHead>Lab</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">
                        {contract.content.contract_number}
                      </TableCell>
                      <TableCell>{contract.content.contractor_name}</TableCell>
                      <TableCell>{contract.content.lab_name}</TableCell>
                      <TableCell>
                        ${contract.content.contract_value?.toLocaleString() || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">Active</Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">View Details</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="labs">
          <Card>
            <CardHeader>
              <CardTitle>Accredited Laboratories</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lab Name</TableHead>
                    <TableHead>Accreditation</TableHead>
                    <TableHead>NATA Scope</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {labs.map((lab) => (
                    <TableRow key={lab.id}>
                      <TableCell className="font-medium">{lab.name}</TableCell>
                      <TableCell>{lab.content?.accreditation_no || 'N/A'}</TableCell>
                      <TableCell>
                        {lab.content?.nata_scope_url ? (
                          <a href={lab.content.nata_scope_url} target="_blank" rel="noopener noreferrer">
                            View Scope
                          </a>
                        ) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {lab.content?.accreditation_expiry ?
                          new Date(lab.content.accreditation_expiry).toLocaleDateString() :
                          'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">Active</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Test Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Method</TableHead>
                    <TableHead>Sample Location</TableHead>
                    <TableHead>Lab</TableHead>
                    <TableHead>Scheduled Date</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedule.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell className="font-medium">
                        {test.content.test_method}
                      </TableCell>
                      <TableCell>{test.content.sample_location}</TableCell>
                      <TableCell>{test.content.lab_name}</TableCell>
                      <TableCell>
                        {new Date(test.content.scheduled_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          test.content.priority === 'high' ? 'destructive' :
                          test.content.priority === 'medium' ? 'secondary' : 'outline'
                        }>
                          {test.content.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">Scheduled</Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
