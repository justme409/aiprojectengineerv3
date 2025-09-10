'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Plus, Save, FileText, Edit, Trash2, Eye, Download, Upload, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

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
  items: ITPItem[]
  applicabilityNotes: string
  createdAt: string
  updatedAt: string
}

interface ItpTemplateEditorEnhancedProps {
  templateId?: string
  onSave?: (template: ITPTemplate) => void
  onCancel?: () => void
}

export default function ItpTemplateEditorEnhanced({
  templateId,
  onSave,
  onCancel
}: ItpTemplateEditorEnhancedProps) {
  const params = useParams()
  const projectId = params.projectId as string

  const [template, setTemplate] = useState<ITPTemplate>({
    id: templateId || '',
    name: '',
    description: '',
    version: '1.0',
    status: 'draft',
    items: [],
    applicabilityNotes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  const [loading, setLoading] = useState(!!templateId)
  const [editingItem, setEditingItem] = useState<ITPItem | null>(null)
  const [showItemForm, setShowItemForm] = useState(false)

  const fetchTemplate = useCallback(async () => {
    if (!templateId) return

    try {
      const response = await fetch(`/api/v1/itp?projectId=${projectId}&type=template`)
      if (response.ok) {
        const data = await response.json()
        const templateData = data.itp.find((t: any) => t.id === templateId)

        if (templateData) {
          const itpTemplate: ITPTemplate = {
            id: templateData.id,
            name: templateData.name,
            description: templateData.content?.description || '',
            version: templateData.content?.version || '1.0',
            status: templateData.status,
            applicabilityNotes: templateData.content?.applicabilityNotes || '',
            items: templateData.content?.items || [],
            createdAt: templateData.created_at,
            updatedAt: templateData.updated_at,
          }
          setTemplate(itpTemplate)
        }
      }
    } catch (error) {
      console.error('Error fetching template:', error)
    } finally {
      setLoading(false)
    }
  }, [templateId, projectId])

  useEffect(() => {
    if (templateId) {
      fetchTemplate()
    }
  }, [fetchTemplate, templateId])

  const handleSave = async () => {
    try {
      const content = {
        description: template.description,
        version: template.version,
        applicabilityNotes: template.applicabilityNotes,
        items: template.items
      }

      if (templateId) {
        // Update existing template
        const response = await fetch('/api/v1/itp', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: templateId,
            content,
            status: template.status
          })
        })

        if (response.ok) {
          console.log('Template updated successfully')
        }
      } else {
        // Create new template
        const response = await fetch('/api/v1/itp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'itp_template',
            name: template.name,
            projectId,
            content
          })
        })

        if (response.ok) {
          const data = await response.json()
          setTemplate(prev => ({ ...prev, id: data.id }))
          console.log('Template created successfully')
        }
      }

      if (onSave) {
        onSave(template)
      }
    } catch (error) {
      console.error('Error saving template:', error)
    }
  }

  const addItem = () => {
    const newItem: ITPItem = {
      id: `item-${Date.now()}`,
      code: '',
      title: '',
      description: '',
      pointType: 'record',
      acceptanceCriteria: '',
      requiredRecords: [],
      slaHours: 24,
      jurisdictionRules: [],
    }
    setEditingItem(newItem)
    setShowItemForm(true)
  }

  const saveItem = () => {
    if (!editingItem) return

    if (template.items.find(item => item.id === editingItem.id)) {
      // Update existing item
      setTemplate(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.id === editingItem.id ? editingItem : item
        ),
      }))
    } else {
      // Add new item
      setTemplate(prev => ({
        ...prev,
        items: [...prev.items, editingItem],
      }))
    }

    setEditingItem(null)
    setShowItemForm(false)
  }

  const deleteItem = (itemId: string) => {
    setTemplate(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId),
    }))
  }

  const getPointTypeBadge = (pointType: string) => {
    const variants = {
      hold: 'destructive',
      witness: 'default',
      surveillance: 'secondary',
      record: 'outline',
    } as const

    return (
      <Badge variant={variants[pointType as keyof typeof variants]}>
        {pointType}
      </Badge>
    )
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {templateId ? 'Edit ITP Template' : 'Create ITP Template'}
            </h1>
            <p className="text-gray-600 mt-1">Inspection and Test Plan Template Editor</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Template
          </Button>
        </div>
      </div>

      {/* Template Details */}
      <Card>
        <CardHeader>
          <CardTitle>Template Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Name
              </label>
              <Input
                value={template.name}
                onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter template name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Version
              </label>
              <Input
                value={template.version}
                onChange={(e) => setTemplate(prev => ({ ...prev, version: e.target.value }))}
                placeholder="e.g., 1.0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <Textarea
              value={template.description}
              onChange={(e) => setTemplate(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the purpose and scope of this template"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Applicability Notes
            </label>
            <Textarea
              value={template.applicabilityNotes}
              onChange={(e) => setTemplate(prev => ({ ...prev, applicabilityNotes: e.target.value }))}
              placeholder="When and where this template should be used"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* ITP Items */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Inspection Points</CardTitle>
              <CardDescription>
                Define the inspection and test points for this template
              </CardDescription>
            </div>
            <Button onClick={addItem}>
              <Plus className="w-4 h-4 mr-2" />
              Add Inspection Point
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {template.items.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No inspection points yet</h3>
              <p className="text-gray-600 mb-4">
                Add inspection and test points to define your ITP template
              </p>
              <Button onClick={addItem}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Point
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>SLA (hours)</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {template.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm">{item.code}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-gray-600">{item.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getPointTypeBadge(item.pointType)}</TableCell>
                    <TableCell>{item.slaHours}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingItem(item)
                            setShowItemForm(true)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Item Edit Form Modal */}
      {showItemForm && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingItem.id.startsWith('item-') ? 'Add Inspection Point' : 'Edit Inspection Point'}
                </h2>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowItemForm(false)
                    setEditingItem(null)
                  }}
                >
                  Close
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code
                  </label>
                  <Input
                    value={editingItem.code}
                    onChange={(e) => setEditingItem(prev => prev ? { ...prev, code: e.target.value } : null)}
                    placeholder="e.g., CF-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Point Type
                  </label>
                  <select
                    value={editingItem.pointType}
                    onChange={(e) => setEditingItem(prev => prev ? { ...prev, pointType: e.target.value as any } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="record">Record</option>
                    <option value="surveillance">Surveillance</option>
                    <option value="witness">Witness</option>
                    <option value="hold">Hold</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <Input
                  value={editingItem.title}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, title: e.target.value } : null)}
                  placeholder="Inspection point title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Textarea
                  value={editingItem.description}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, description: e.target.value } : null)}
                  placeholder="Describe what this inspection point covers"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Acceptance Criteria
                </label>
                <Textarea
                  value={editingItem.acceptanceCriteria}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, acceptanceCriteria: e.target.value } : null)}
                  placeholder="What constitutes acceptable completion"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SLA Hours
                  </label>
                  <Input
                    type="number"
                    value={editingItem.slaHours}
                    onChange={(e) => setEditingItem(prev => prev ? { ...prev, slaHours: parseInt(e.target.value) || 24 } : null)}
                    placeholder="24"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Required Records
                  </label>
                  <Input
                    value={editingItem.requiredRecords.join(', ')}
                    onChange={(e) => setEditingItem(prev => prev ? {
                      ...prev,
                      requiredRecords: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                    } : null)}
                    placeholder="Certificate, Checklist, Report"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowItemForm(false)
                    setEditingItem(null)
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={saveItem}>
                  {editingItem.id.startsWith('item-') ? 'Add Point' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
