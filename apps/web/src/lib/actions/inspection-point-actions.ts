'use server'

import { pool } from '@/lib/db'
import { upsertAssetsAndEdges } from '@/lib/actions/graph-repo'
import { RelationshipEdgeType } from '@/types/graph'

export async function createInspectionPoint(formData: FormData) {
  try {
    const projectId = formData.get('projectId') as string
    const lotId = formData.get('lotId') as string
    const code = formData.get('code') as string
    const title = formData.get('title') as string
    const pointType = formData.get('pointType') as string
    const itpItemRef = formData.get('itpItemRef') as string

    const spec = {
      asset: {
        type: 'inspection_point',
        name: `${code}: ${title}`,
        project_id: projectId,
        content: {
          code,
          title,
          point_type: pointType,
          itp_item_ref: itpItemRef,
          lot_id: lotId,
          created_at: new Date().toISOString()
        },
        status: 'draft'
      },
      edges: [{
        from_asset_id: '', // Will be set after creation
        to_asset_id: lotId,
        edge_type: 'APPLIES_TO' as RelationshipEdgeType,
        properties: { point_type: pointType }
      }],
      idempotency_key: `inspection_point:${code}:${projectId}`,
      audit_context: { action: 'create_inspection_point', user_id: 'system' }
    }

    const result = await upsertAssetsAndEdges(spec)
    return { success: true, pointId: result.id }
  } catch (error) {
    console.error('Error creating inspection point:', error)
    return { success: false, error: 'Failed to create inspection point' }
  }
}

export async function notifyWitness(formData: FormData) {
  try {
    const pointId = formData.get('pointId') as string
    const notifiedBy = formData.get('notifiedBy') as string
    const slaDueAt = formData.get('slaDueAt') as string

    const spec = {
      asset: {
        id: pointId,
        content: {
          notified_at: new Date().toISOString(),
          notified_by: notifiedBy,
          sla_due_at: slaDueAt,
          status: 'notified'
        }
      },
      edges: [],
      idempotency_key: `notify_witness:${pointId}`,
      audit_context: { action: 'notify_witness', user_id: 'system' }
    }

    await upsertAssetsAndEdges(spec)
    return { success: true }
  } catch (error) {
    console.error('Error notifying witness:', error)
    return { success: false, error: 'Failed to notify witness' }
  }
}

export async function releaseHoldPoint(formData: FormData) {
  try {
    const pointId = formData.get('pointId') as string
    const releasedBy = formData.get('releasedBy') as string
    const releaseNotes = formData.get('releaseNotes') as string

    const spec = {
      asset: {
        id: pointId,
        content: {
          released_at: new Date().toISOString(),
          released_by: releasedBy,
          release_notes: releaseNotes,
          status: 'released'
        },
        approval_state: 'approved'
      },
      edges: [],
      idempotency_key: `release_hold_point:${pointId}`,
      audit_context: { action: 'release_hold_point', user_id: 'system' }
    }

    await upsertAssetsAndEdges(spec)
    return { success: true }
  } catch (error) {
    console.error('Error releasing hold point:', error)
    return { success: false, error: 'Failed to release hold point' }
  }
}

export async function rejectHoldPoint(formData: FormData) {
  try {
    const pointId = formData.get('pointId') as string
    const rejectedBy = formData.get('rejectedBy') as string
    const rejectionReason = formData.get('rejectionReason') as string

    const spec = {
      asset: {
        id: pointId,
        content: {
          rejected_at: new Date().toISOString(),
          rejected_by: rejectedBy,
          rejection_reason: rejectionReason,
          status: 'rejected'
        },
        approval_state: 'rejected'
      },
      edges: [],
      idempotency_key: `reject_hold_point:${pointId}`,
      audit_context: { action: 'reject_hold_point', user_id: 'system' }
    }

    await upsertAssetsAndEdges(spec)
    return { success: true }
  } catch (error) {
    console.error('Error rejecting hold point:', error)
    return { success: false, error: 'Failed to reject hold point' }
  }
}

export async function setSLA(formData: FormData) {
  try {
    const pointId = formData.get('pointId') as string
    const slaHours = parseInt(formData.get('slaHours') as string)
    const priority = formData.get('priority') as string

    const slaDueAt = new Date()
    slaDueAt.setHours(slaDueAt.getHours() + slaHours)

    const spec = {
      asset: {
        id: pointId,
        content: {
          sla_hours: slaHours,
          sla_due_at: slaDueAt.toISOString(),
          priority: priority || 'normal',
          sla_set_at: new Date().toISOString()
        }
      },
      edges: [],
      idempotency_key: `set_sla:${pointId}`,
      audit_context: { action: 'set_inspection_sla', user_id: 'system' }
    }

    await upsertAssetsAndEdges(spec)
    return { success: true, slaDueAt: slaDueAt.toISOString() }
  } catch (error) {
    console.error('Error setting SLA:', error)
    return { success: false, error: 'Failed to set SLA' }
  }
}

export async function getInspectionPointsByLot(lotId: string, projectId: string) {
  try {
    const result = await pool.query(`
      SELECT a.*
      FROM public.asset_heads a
      WHERE a.project_id = $1
        AND a.type = 'inspection_point'
        AND a.content->>'lot_id' = $2
      ORDER BY a.content->>'sla_due_at' ASC
    `, [projectId, lotId])

    return { success: true, points: result.rows }
  } catch (error) {
    console.error('Error getting inspection points:', error)
    return { success: false, error: 'Failed to get inspection points' }
  }
}