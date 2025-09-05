'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tree, TreeNode } from '@/components/ui/tree'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Trash2, FileText, Target, CheckCircle } from 'lucide-react'

interface WbsNode {
  id: string
  parentId?: string
  node_type: 'discipline' | 'work_package' | 'activity'
  name: string
  description: string
  source_reference_uuids: string[]
  applicable_specifications: string[]
  itp_required: boolean
  is_leaf_node: boolean
}

interface WbsStructure {
  nodes: WbsNode[]
  metadata: {
    total_nodes: number
    disciplines_count: number
    specifications_referenced: string[]
    complexity_score: number
  }
}

interface WbsViewProps {
  projectId: string
}

export default function WbsView({ projectId }: WbsViewProps) {
  const [wbsData, setWbsData] = useState<WbsStructure | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedNode, setSelectedNode] = useState<WbsNode | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [action, setAction] = useState<'create' | 'edit'>('create')

  useEffect(() => {
    fetchWbsData()
  }, [projectId])

  const fetchWbsData = async () => {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/plans`)
      const data = await response.json()

      // Filter for WBS plan
      const wbsPlan = data.data?.find((plan: any) => plan.type === 'plan' && plan.subtype === 'wbs')
      if (wbsPlan) {
        setWbsData(wbsPlan.content)
      }
    } catch (error) {
      console.error('Error fetching WBS data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNodeAction = (node: WbsNode, actionType: 'create' | 'edit') => {
    setSelectedNode(node)
    setAction(actionType)
    setDialogOpen(true)
  }

  const submitNodeForm = async (formData: FormData) => {
    const nodeData = {
      id: formData.get('id') || `node_${Date.now()}`,
      parentId: formData.get('parentId') || undefined,
      node_type: formData.get('node_type'),
      name: formData.get('name'),
      description: formData.get('description'),
      source_reference_uuids: [],
      applicable_specifications: formData.get('specifications')?.split(',').map((s: string) => s.trim()) || [],
      itp_required: formData.get('itp_required') === 'true',
      is_leaf_node: formData.get('node_type') === 'activity'
    }

    try {
      const response = await fetch(`/api/v1/projects/${projectId}/plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: action === 'create' ? 'create_wbs_node' : 'update_wbs_node',
          node: nodeData
        })
      })

      if (response.ok) {
        setDialogOpen(false)
        fetchWbsData()
      }
    } catch (error) {
      console.error('Error saving WBS node:', error)
    }
  }

  const buildTreeData = (nodes: WbsNode[]): TreeNode[] => {
    const nodeMap = new Map<string, TreeNode>()
    const rootNodes: TreeNode[] = []

    // Create all nodes
    nodes.forEach(node => {
      nodeMap.set(node.id, {
        id: node.id,
        label: node.name,
        children: [],
        data: node
      })
    })

    // Build hierarchy
    nodes.forEach(node => {
      if (node.parentId && nodeMap.has(node.parentId)) {
        nodeMap.get(node.parentId)!.children!.push(nodeMap.get(node.id)!)
      } else {
        rootNodes.push(nodeMap.get(node.id)!)
      }
    })

    return rootNodes
  }

  const getNodeIcon = (nodeType: string) => {
    switch (nodeType) {
      case 'discipline':
        return <FileText className="w-4 h-4" />
      case 'work_package':
        return <Target className="w-4 h-4" />
      case 'activity':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getNodeBadge = (node: WbsNode) => {
    if (node.itp_required) {
      return <Badge className="ml-2 bg-blue-100 text-blue-800">ITP Required</Badge>
    }
    return null
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading WBS...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Work Breakdown Structure</h1>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Node
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create WBS Node</DialogTitle>
              </DialogHeader>
              <form action={submitNodeForm} className="space-y-4">
                <div>
                  <Label htmlFor="node_type">Node Type</Label>
                  <Select name="node_type">
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="discipline">Discipline</SelectItem>
                      <SelectItem value="work_package">Work Package</SelectItem>
                      <SelectItem value="activity">Activity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" />
                </div>
                <div>
                  <Label htmlFor="specifications">Applicable Specifications (comma-separated)</Label>
                  <Input id="specifications" name="specifications" placeholder="AS 1288, ISO 9001, etc." />
                </div>
                <div>
                  <Label htmlFor="itp_required">ITP Required</Label>
                  <Select name="itp_required">
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit">Create Node</Button>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="outline">Export WBS</Button>
          <Button variant="outline">Import WBS</Button>
        </div>
      </div>

      {wbsData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Nodes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{wbsData.metadata.total_nodes}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Disciplines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{wbsData.metadata.disciplines_count}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Work Packages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {wbsData.nodes.filter(n => n.node_type === 'work_package').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {wbsData.nodes.filter(n => n.node_type === 'activity').length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>WBS Hierarchy</CardTitle>
            </CardHeader>
            <CardContent>
              <Tree
                data={buildTreeData(wbsData.nodes)}
                renderNode={(node) => (
                  <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      {getNodeIcon(node.data.node_type)}
                      <span className="font-medium">{node.label}</span>
                      <Badge variant="outline">{node.data.node_type}</Badge>
                      {getNodeBadge(node.data)}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleNodeAction(node.data, 'edit')}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {/* handle delete */}}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
              />
            </CardContent>
          </Card>

          {wbsData.metadata.specifications_referenced.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Referenced Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {wbsData.metadata.specifications_referenced.map((spec, index) => (
                    <Badge key={index} variant="secondary">{spec}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!wbsData && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <FileText className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No WBS Data</h3>
            <p className="text-muted-foreground mb-4">Create your first WBS node to get started</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Root Node
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Node Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{action === 'create' ? 'Create' : 'Edit'} WBS Node</DialogTitle>
          </DialogHeader>
          <form action={submitNodeForm} className="space-y-4">
            <input type="hidden" name="id" value={selectedNode?.id} />
            <input type="hidden" name="parentId" value={selectedNode?.parentId} />

            <div>
              <Label htmlFor="node_type">Node Type</Label>
              <Select name="node_type" defaultValue={selectedNode?.node_type}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="discipline">Discipline</SelectItem>
                  <SelectItem value="work_package">Work Package</SelectItem>
                  <SelectItem value="activity">Activity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={selectedNode?.name} required />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={selectedNode?.description}
              />
            </div>

            <div>
              <Label htmlFor="specifications">Applicable Specifications</Label>
              <Input
                id="specifications"
                name="specifications"
                defaultValue={selectedNode?.applicable_specifications.join(', ')}
                placeholder="AS 1288, ISO 9001, etc."
              />
            </div>

            <div>
              <Label htmlFor="itp_required">ITP Required</Label>
              <Select name="itp_required" defaultValue={selectedNode?.itp_required ? 'true' : 'false'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                {action === 'create' ? 'Create' : 'Update'} Node
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
