import { query } from '@/lib/db'
import { upsertAssetsAndEdges } from '@/lib/actions/graph-repo'

export async function planSampling(projectId: string, lotId: string, samplingData: any) {
  // Create sampling plan asset
  const result = await upsertAssetsAndEdges({
    asset: {
      type: 'inspection_request',
      name: `Sampling Plan for Lot ${lotId}`,
      project_id: projectId,
      content: {
        lot_asset_id: lotId,
        sampling_method: samplingData.method || 'annex_l',
        planned_samples: samplingData.samples || [],
        test_requirements: samplingData.tests || [],
        planned_at: new Date().toISOString()
      }
    },
    idempotency_key: `sampling_plan:${projectId}:${lotId}`
  })

  return result
}

export async function closeWorkLot(projectId: string, lotId: string, closeData: any) {
  const result = await upsertAssetsAndEdges({
    asset: {
      id: lotId,
      content: {
        status: 'closed',
        closed_at: new Date().toISOString(),
        close_reason: closeData.reason,
        close_notes: closeData.notes
      }
    },
    idempotency_key: `close_lot:${lotId}`
  })

  return result
}

export async function reopenLot(projectId: string, lotId: string, reopenData: any) {
  const result = await upsertAssetsAndEdges({
    asset: {
      id: lotId,
      content: {
        status: 'active',
        reopened_at: new Date().toISOString(),
        reopen_reason: reopenData.reason,
        reopen_notes: reopenData.notes
      }
    },
    idempotency_key: `reopen_lot:${lotId}`
  })

  return result
}

export async function applyIndicativeConformance(projectId: string, lotId: string, conformanceData: any) {
  const result = await upsertAssetsAndEdges({
    asset: {
      type: 'record',
      name: `Indicative Conformance for Lot ${lotId}`,
      project_id: projectId,
      content: {
        lot_asset_id: lotId,
        conformance_type: 'indicative',
        applied_at: new Date().toISOString(),
        criteria: conformanceData.criteria,
        applied_by: conformanceData.applied_by,
        justification: conformanceData.justification
      }
    },
    idempotency_key: `indicative_conformance:${projectId}:${lotId}`
  })

  return result
}

export async function getLotRegisterData(projectId: string) {
  const lots = await query(`
    SELECT * FROM public.work_lot_register
    WHERE project_id = $1
    ORDER BY created_at DESC
  `, [projectId])

  return lots.rows
}

export async function exportLotRegister(projectId: string) {
  const lots = await getLotRegisterData(projectId)

  // In a real implementation, this would generate a PDF or Excel file
  return {
    data: lots,
    filename: `lot_register_${projectId}_${new Date().toISOString().split('T')[0]}.json`
  }
}

export async function updateLotProgress(projectId: string, lotId: string, progressData: any) {
  const result = await upsertAssetsAndEdges({
    asset: {
      id: lotId,
      content: {
        progress_percentage: progressData.percentage,
        progress_notes: progressData.notes,
        last_progress_update: new Date().toISOString()
      }
    },
    idempotency_key: `progress_update:${lotId}`
  })

  return result
}
