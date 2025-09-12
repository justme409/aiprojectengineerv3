import React from 'react'
import WbsTreeView from '@/components/features/wbs/WbsTreeView'
import { WbsItem } from '@/types/graph'

type ProjectWbsPageProps = {
  params: Promise<{ projectId: string }>
}

export default async function ProjectWbsPage({
  params,
}: ProjectWbsPageProps) {
  // Fetch WBS data from assets API
  const { projectId } = await params
  let wbsTreeData: WbsItem[] | null = null

  try {
    // First try to get WBS assets directly
    const assetsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/assets?projectId=${projectId}&type=wbs_node`, {
      cache: 'no-store' // Ensure fresh data
    })

    if (assetsResponse.ok) {
      const assetsData = await assetsResponse.json()
      const wbsAssets = assetsData.assets || []

      if (wbsAssets.length > 0) {
        // Transform assets to WbsItem format
        wbsTreeData = wbsAssets.map((asset: any) => ({
          id: asset.id,
          name: asset.name,
          parentId: asset.parent_asset_id,
          node_type: asset.subtype || 'activity',
          path_key: asset.path_key,
          content: asset.content || {}
        }))
      }
    }

    // If no assets found, try the legacy API endpoint
    if (!wbsTreeData) {
      const legacyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/projects/${projectId}/plans?type=wbs`, {
        cache: 'no-store'
      })

      if (legacyResponse.ok) {
        const legacyData = await legacyResponse.json()
        wbsTreeData = legacyData.wbs || null
      }
    }
  } catch (error) {
    console.error('Error fetching WBS data:', error)
    wbsTreeData = null
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold mb-4">Work Breakdown Structure</h1>

      <WbsTreeView
        projectId={projectId}
        initialWbsData={wbsTreeData}
        projectName="Project"
      />
    </div>
  )
}

export const revalidate = 0
