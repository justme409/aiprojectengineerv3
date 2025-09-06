'use server'

import { pool } from '@/lib/db'
import { upsertAssetsAndEdges } from '@/lib/actions/graph-repo'
import { RelationshipEdgeType } from '@/types/graph'

export async function planSampling(formData: FormData) {
  try {
    const projectId = formData.get('projectId') as string
    const lotId = formData.get('lotId') as string
    const sampleCount = parseInt(formData.get('sampleCount') as string)

    // Create sampling plan asset
    const spec = {
      asset: {
        type: 'plan',
        name: `Sampling Plan for Lot ${lotId}`,
        project_id: projectId,
        content: {
          plan_type: 'sampling',
          lot_id: lotId,
          sample_count: sampleCount,
          planned_at: new Date().toISOString()
        },
        status: 'active'
      },
      edges: [{
        from_asset_id: '', // Will be set after creation
        to_asset_id: lotId,
        edge_type: 'APPLIES_TO' as RelationshipEdgeType,
        properties: { plan_type: 'sampling' }
      }],
      idempotency_key: `sampling_plan:${lotId}:${projectId}`,
      audit_context: { action: 'plan_sampling', user_id: 'system' }
    }

    const result = await upsertAssetsAndEdges(spec)
    return { success: true, planId: result.id }
  } catch (error) {
    console.error('Error planning sampling:', error)
    return { success: false, error: 'Failed to plan sampling' }
  }
}

export async function closeWorkLot(formData: FormData) {
  try {
    const lotId = formData.get('lotId') as string
    const projectId = formData.get('projectId') as string

    // Check if lot can be closed (all HP/WP released)
    const inspectionCheck = await pool.query(`
      SELECT COUNT(*) as unreleased_points
      FROM public.asset_heads
      WHERE project_id = $1 AND type = 'inspection_point'
        AND content->>'lot_id' = $2
        AND (content->>'released_at' IS NULL OR content->>'approved' != 'true')
    `, [projectId, lotId])

    if (parseInt(inspectionCheck.rows[0].unreleased_points) > 0) {
      return { success: false, error: 'Cannot close lot: unreleased inspection points' }
    }

    // Update lot status
    const spec = {
      asset: {
        id: lotId,
        status: 'closed',
        content: {
          closed_at: new Date().toISOString(),
          closed_by: 'system' // In real app, get from session
        }
      },
      edges: [],
      idempotency_key: `close_lot:${lotId}`,
      audit_context: { action: 'close_work_lot', user_id: 'system' }
    }

    await upsertAssetsAndEdges(spec)
    return { success: true }
  } catch (error) {
    console.error('Error closing work lot:', error)
    return { success: false, error: 'Failed to close work lot' }
  }
}

export async function reopenLot(formData: FormData) {
  try {
    const lotId = formData.get('lotId') as string
    const reason = formData.get('reason') as string

    const spec = {
      asset: {
        id: lotId,
        status: 'active',
        content: {
          reopened_at: new Date().toISOString(),
          reopened_reason: reason,
          reopened_by: 'system'
        }
      },
      edges: [],
      idempotency_key: `reopen_lot:${lotId}`,
      audit_context: { action: 'reopen_work_lot', user_id: 'system' }
    }

    await upsertAssetsAndEdges(spec)
    return { success: true }
  } catch (error) {
    console.error('Error reopening lot:', error)
    return { success: false, error: 'Failed to reopen lot' }
  }
}

export async function applyIndicativeConformance(formData: FormData) {
  try {
    const lotId = formData.get('lotId') as string
    const conformanceData = JSON.parse(formData.get('conformanceData') as string)

    const spec = {
      asset: {
        id: lotId,
        content: {
          indicative_conformance: conformanceData,
          conformance_applied_at: new Date().toISOString(),
          conformance_applied_by: 'system'
        }
      },
      edges: [],
      idempotency_key: `indicative_conformance:${lotId}`,
      audit_context: { action: 'apply_indicative_conformance', user_id: 'system' }
    }

    await upsertAssetsAndEdges(spec)
    return { success: true }
  } catch (error) {
    console.error('Error applying indicative conformance:', error)
    return { success: false, error: 'Failed to apply indicative conformance' }
  }
}

export async function getWorkLotStatus(lotId: string, projectId: string) {
  try {
    // Get lot details with inspection points and test results
    const lotResult = await pool.query(`
      SELECT a.*, wl.*
      FROM public.asset_heads a
      LEFT JOIN public.work_lot_register wl ON wl.lot_asset_id = a.id
      WHERE a.id = $1 AND a.project_id = $2
    `, [lotId, projectId])

    if (lotResult.rows.length === 0) {
      return { success: false, error: 'Lot not found' }
    }

    const lot = lotResult.rows[0]

    // Calculate completion status
    const totalPoints = lot.inspection_points?.length || 0
    const releasedPoints = lot.inspection_points?.filter((p: any) => p.released_at).length || 0
    const completionPercentage = totalPoints > 0 ? (releasedPoints / totalPoints) * 100 : 0

    return {
      success: true,
      lot: {
        ...lot,
        completion_percentage: completionPercentage,
        can_close: completionPercentage === 100 && lot.lot_status !== 'closed'
      }
    }
  } catch (error) {
    console.error('Error getting work lot status:', error)
    return { success: false, error: 'Failed to get lot status' }
  }
}