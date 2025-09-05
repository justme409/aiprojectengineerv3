'use client'

import { useState, useEffect } from 'react'
import { Plus, MapPin, Layers, Ruler } from 'lucide-react'

interface LbsNode {
  id: string
  parentId?: string
  node_type: 'site' | 'zone' | 'chainage' | 'layer' | 'element'
  name: string
  description: string
  coordinates?: {
    lat: number
    lon: number
  }
  chainage_start?: number
  chainage_end?: number
  elevation?: number
}

interface LbsViewProps {
  projectId: string
}

export default function LbsView({ projectId }: LbsViewProps) {
  const [lbsNodes, setLbsNodes] = useState<LbsNode[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLbsData()
  }, [projectId])

  const fetchLbsData = async () => {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/plans`)
      const data = await response.json()

      // Filter for LBS plan
      const lbsPlan = data.data?.find((plan: any) => plan.type === 'plan' && plan.subtype === 'lbs')
      if (lbsPlan) {
        setLbsNodes(lbsPlan.content.nodes || [])
      }
    } catch (error) {
      console.error('Error fetching LBS data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getNodeIcon = (nodeType: string) => {
    switch (nodeType) {
      case 'site':
        return <MapPin className="w-4 h-4 text-blue-600" />
      case 'zone':
        return <Layers className="w-4 h-4 text-green-600" />
      case 'chainage':
        return <Ruler className="w-4 h-4 text-orange-600" />
      case 'layer':
        return <Layers className="w-4 h-4 text-purple-600" />
      case 'element':
        return <div className="w-4 h-4 bg-gray-600 rounded" />
      default:
        return <MapPin className="w-4 h-4" />
    }
  }

  const getNodeBadge = (nodeType: string) => {
    const colors = {
      site: 'bg-blue-100 text-blue-800',
      zone: 'bg-green-100 text-green-800',
      chainage: 'bg-orange-100 text-orange-800',
      layer: 'bg-purple-100 text-purple-800',
      element: 'bg-gray-100 text-gray-800'
    }
    return colors[nodeType as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const buildHierarchy = (nodes: LbsNode[]) => {
    const nodeMap = new Map<string, LbsNode & { children: LbsNode[] }>()
    const rootNodes: (LbsNode & { children: LbsNode[] })[] = []

    // Create all nodes
    nodes.forEach(node => {
      nodeMap.set(node.id, { ...node, children: [] })
    })

    // Build hierarchy
    nodes.forEach(node => {
      if (node.parentId && nodeMap.has(node.parentId)) {
        nodeMap.get(node.parentId)!.children.push(nodeMap.get(node.id)!)
      } else {
        rootNodes.push(nodeMap.get(node.id)!)
      }
    })

    return rootNodes
  }

  const renderNode = (node: LbsNode & { children: LbsNode[] }, level = 0) => (
    <div key={node.id} className="mb-2">
      <div className={`flex items-center p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow ${level > 0 ? 'ml-6' : ''}`}>
        {getNodeIcon(node.node_type)}
        <div className="ml-3 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900">{node.name}</h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getNodeBadge(node.node_type)}`}>
              {node.node_type}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{node.description}</p>
          {node.coordinates && (
            <p className="text-xs text-gray-500 mt-1">
              📍 {node.coordinates.lat.toFixed(6)}, {node.coordinates.lon.toFixed(6)}
            </p>
          )}
          {node.chainage_start && node.chainage_end && (
            <p className="text-xs text-gray-500 mt-1">
              📏 Chainage: {node.chainage_start}m - {node.chainage_end}m
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100">
            Edit
          </button>
          <button className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100">
            Delete
          </button>
        </div>
      </div>
      {node.children.map(child => renderNode(child, level + 1))}
    </div>
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Location Breakdown Structure</h1>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Add Location
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Import GIS
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-blue-600">{lbsNodes.filter(n => n.node_type === 'site').length}</div>
          <div className="text-sm text-gray-600">Sites</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-green-600">{lbsNodes.filter(n => n.node_type === 'zone').length}</div>
          <div className="text-sm text-gray-600">Zones</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-orange-600">{lbsNodes.filter(n => n.node_type === 'chainage').length}</div>
          <div className="text-sm text-gray-600">Chainages</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-purple-600">{lbsNodes.filter(n => n.node_type === 'layer').length}</div>
          <div className="text-sm text-gray-600">Layers</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-gray-600">{lbsNodes.filter(n => n.node_type === 'element').length}</div>
          <div className="text-sm text-gray-600">Elements</div>
        </div>
      </div>

      {/* LBS Hierarchy */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Location Hierarchy</h2>
        </div>
        <div className="p-4">
          {lbsNodes.length > 0 ? (
            <div className="space-y-2">
              {buildHierarchy(lbsNodes).map(node => renderNode(node))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Locations Defined</h3>
              <p className="text-gray-600 mb-4">Start by adding your first site or location to the LBS.</p>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto">
                <Plus className="w-4 h-4" />
                Add First Location
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
