import { query } from '@/lib/db'
import { upsertAssetsAndEdges } from '@/lib/actions/graph-repo'

export async function createInspectionPoint(projectId: string, pointData: any) {
  const result = await upsertAssetsAndEdges({
    asset: {
      type: 'inspection_point',
      name: pointData.title,
      project_id: projectId,
      content: {
        code: pointData.code,
        title: pointData.title,
        point_type: pointData.point_type, // 'hold', 'witness', 'surveillance', 'record'
        itp_item_ref: pointData.itp_item_ref,
        jurisdiction_rule_ref: pointData.jurisdiction_rule_ref,
        sla_due_at: pointData.sla_due_at,
        sla_hours: pointData.sla_hours,
        notified_at: null,
        released_at: null,
        status: 'pending'
      }
    },
    idempotency_key: `inspection_point:${projectId}:${pointData.code}`
  })

  return result
}

export async function notifyWitness(projectId: string, pointId: string, notificationData: any = {}) {
  const result = await upsertAssetsAndEdges({
    asset: {
      id: pointId,
      content: {
        notified_at: new Date().toISOString(),
        status: 'notified',
        notification_notes: notificationData.notes
      }
    },
    idempotency_key: `notify_witness:${pointId}`
  })

  return result
}

export async function releaseHoldPoint(projectId: string, pointId: string, releaseData: any) {
  const result = await upsertAssetsAndEdges({
    asset: {
      id: pointId,
      content: {
        released_at: new Date().toISOString(),
        status: 'released',
        release_notes: releaseData.notes,
        released_by: releaseData.released_by
      }
    },
    idempotency_key: `release_hold:${pointId}`
  })

  return result
}

export async function rejectHoldPoint(projectId: string, pointId: string, rejectionData: any) {
  const result = await upsertAssetsAndEdges({
    asset: {
      id: pointId,
      content: {
        rejected_at: new Date().toISOString(),
        status: 'rejected',
        rejection_reason: rejectionData.reason,
        rejected_by: rejectionData.rejected_by
      }
    },
    idempotency_key: `reject_hold:${pointId}`
  })

  return result
}

export async function setSLA(projectId: string, pointId: string, slaData: any) {
  const result = await upsertAssetsAndEdges({
    asset: {
      id: pointId,
      content: {
        sla_due_at: slaData.due_at,
        sla_hours: slaData.hours,
        sla_priority: slaData.priority || 'normal'
      }
    },
    idempotency_key: `set_sla:${pointId}`
  })

  return result
}

export async function getHoldWitnessRegister(projectId: string) {
  const register = await query(`
    SELECT * FROM public.hold_witness_register
    WHERE project_id = $1
    ORDER BY sla_due_at ASC
  `, [projectId])

  return register.rows
}

export async function updateInspectionPoint(projectId: string, pointId: string, updateData: any) {
  const result = await upsertAssetsAndEdges({
    asset: {
      id: pointId,
      content: updateData
    },
    idempotency_key: `update_point:${pointId}`
  })

  return result
}

export async function deleteInspectionPoint(projectId: string, pointId: string) {
  // In a real implementation, this would mark as deleted rather than actually delete
  const result = await upsertAssetsAndEdges({
    asset: {
      id: pointId,
      is_deleted: true
    },
    idempotency_key: `delete_point:${pointId}`
  })

  return result
}
