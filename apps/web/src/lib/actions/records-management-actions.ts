import { query } from '@/lib/db'
import { upsertAssetsAndEdges } from '@/lib/actions/graph-repo'

export async function createRMP(projectId: string, rmpData: any) {
  const result = await upsertAssetsAndEdges({
    asset: {
      type: 'plan',
      subtype: 'records_management_plan',
      name: rmpData.title,
      project_id: projectId,
      content: {
        title: rmpData.title,
        scope: rmpData.scope,
        records_schedule: rmpData.records_schedule,
        retention_periods: rmpData.retention_periods,
        disposal_methods: rmpData.disposal_methods,
        jurisdiction_requirements: rmpData.jurisdiction_requirements,
        created_by: rmpData.created_by
      }
    },
    idempotency_key: `rmp:${projectId}:${rmpData.title.toLowerCase().replace(/\s+/g, '_')}`
  })

  return result
}

export async function updateIdentifiedRecordsList(projectId: string, assetId: string, recordsData: any) {
  const result = await upsertAssetsAndEdges({
    asset: {
      id: assetId,
      content: {
        records_identified: recordsData.records,
        last_updated: new Date().toISOString(),
        updated_by: recordsData.updated_by
      }
    },
    idempotency_key: `update_records:${assetId}`
  })

  return result
}

export async function markDelivered(projectId: string, assetId: string, deliveryData: any) {
  const result = await upsertAssetsAndEdges({
    asset: {
      type: 'record',
      name: `Records Delivery - ${deliveryData.records_type}`,
      project_id: projectId,
      content: {
        asset_id: assetId,
        delivered_at: new Date().toISOString(),
        delivered_to: deliveryData.delivered_to,
        delivery_method: deliveryData.delivery_method,
        delivery_reference: deliveryData.delivery_reference,
        records_type: deliveryData.records_type,
        delivery_notes: deliveryData.notes
      }
    },
    idempotency_key: `records_delivery:${projectId}:${assetId}`
  })

  // Update the original asset to mark as delivered
  await upsertAssetsAndEdges({
    asset: {
      id: assetId,
      content: {
        records_delivered: true,
        delivered_at: new Date().toISOString(),
        delivery_reference: deliveryData.delivery_reference
      }
    },
    idempotency_key: `mark_delivered:${assetId}`
  })

  return result
}

export async function exportRMPStatus(projectId: string) {
  const records = await query(`
    SELECT * FROM public.identified_records_register
    WHERE project_id = $1
    ORDER BY created_at DESC
  `, [projectId])

  // In a real implementation, this would generate a PDF report
  return {
    data: records.rows,
    filename: `rmp_status_${projectId}_${new Date().toISOString().split('T')[0]}.json`
  }
}

export async function getIdentifiedRecordsRegister(projectId: string) {
  const records = await query(`
    SELECT * FROM public.identified_records_register
    WHERE project_id = $1
    ORDER BY created_at DESC
  `, [projectId])

  return records.rows
}

export async function validateRecordsDelivery(projectId: string, assetId: string) {
  // Check if records delivery meets compliance requirements
  const asset = await query(`
    SELECT * FROM public.assets
    WHERE id = $1 AND project_id = $2 AND is_current AND NOT is_deleted
  `, [assetId, projectId])

  if (asset.rows.length === 0) {
    throw new Error('Asset not found')
  }

  const record = asset.rows[0]
  const recordsIdentified = record.content?.records_identified || []
  const recordsDelivered = record.content?.records_delivered || false

  // Basic validation - in a real implementation, this would be more sophisticated
  const validation = {
    asset_id: assetId,
    records_identified_count: recordsIdentified.length,
    records_delivered: recordsDelivered,
    compliance_status: recordsDelivered ? 'compliant' : 'pending',
    validation_date: new Date().toISOString()
  }

  return validation
}
