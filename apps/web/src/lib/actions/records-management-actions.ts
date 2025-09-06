'use server'

import { pool } from '@/lib/db'
import { upsertAssetsAndEdges } from '@/lib/actions/graph-repo'

export async function createRMP(formData: FormData) {
  try {
    const projectId = formData.get('projectId') as string
    const title = formData.get('title') as string
    const jurisdiction = formData.get('jurisdiction') as string
    const identifiedRecords = JSON.parse(formData.get('identifiedRecords') as string)

    const spec = {
      asset: {
        type: 'plan',
        subtype: 'records_management_plan',
        name: title,
        project_id: projectId,
        content: {
          plan_type: 'rmp',
          jurisdiction,
          identified_records: identifiedRecords,
          created_at: new Date().toISOString(),
          version: '1.0'
        },
        status: 'draft'
      },
      edges: [],
      idempotency_key: `rmp:${title}:${projectId}`,
      audit_context: { action: 'create_rmp', user_id: 'system' }
    }

    const result = await upsertAssetsAndEdges(spec)
    return { success: true, rmpId: result.id }
  } catch (error) {
    console.error('Error creating RMP:', error)
    return { success: false, error: 'Failed to create RMP' }
  }
}

export async function updateIdentifiedRecordsList(formData: FormData) {
  try {
    const rmpId = formData.get('rmpId') as string
    const identifiedRecords = JSON.parse(formData.get('identifiedRecords') as string)

    const spec = {
      asset: {
        id: rmpId,
        content: {
          identified_records: identifiedRecords,
          last_updated: new Date().toISOString()
        }
      },
      edges: [],
      idempotency_key: `update_records_list:${rmpId}`,
      audit_context: { action: 'update_identified_records', user_id: 'system' }
    }

    await upsertAssetsAndEdges(spec)
    return { success: true }
  } catch (error) {
    console.error('Error updating identified records:', error)
    return { success: false, error: 'Failed to update records' }
  }
}

export async function markDelivered(formData: FormData) {
  try {
    const recordId = formData.get('recordId') as string
    const deliveredBy = formData.get('deliveredBy') as string
    const deliveryNotes = formData.get('deliveryNotes') as string

    const spec = {
      asset: {
        id: recordId,
        content: {
          delivered_at: new Date().toISOString(),
          delivered_by: deliveredBy,
          delivery_notes: deliveryNotes,
          status: 'delivered'
        },
        status: 'completed'
      },
      edges: [],
      idempotency_key: `mark_delivered:${recordId}`,
      audit_context: { action: 'mark_record_delivered', user_id: 'system' }
    }

    await upsertAssetsAndEdges(spec)
    return { success: true }
  } catch (error) {
    console.error('Error marking record as delivered:', error)
    return { success: false, error: 'Failed to mark record as delivered' }
  }
}

export async function exportRMPStatus(formData: FormData) {
  try {
    const rmpId = formData.get('rmpId') as string
    const projectId = formData.get('projectId') as string

    // Get RMP with all records
    const rmpResult = await pool.query(`
      SELECT a.* FROM public.asset_heads a
      WHERE a.id = $1 AND a.project_id = $2
    `, [rmpId, projectId])

    if (rmpResult.rows.length === 0) {
      return { success: false, error: 'RMP not found' }
    }

    const rmp = rmpResult.rows[0]

    // Get delivery status for all identified records
    const records = rmp.content.identified_records || []
    const deliveredCount = records.filter((record: any) => record.delivered_at).length
    const totalCount = records.length
    const completionPercentage = totalCount > 0 ? (deliveredCount / totalCount) * 100 : 0

    const exportData = {
      rmp_id: rmpId,
      rmp_title: rmp.name,
      project_id: projectId,
      jurisdiction: rmp.content.jurisdiction,
      total_records: totalCount,
      delivered_records: deliveredCount,
      completion_percentage: completionPercentage,
      export_date: new Date().toISOString(),
      records_status: records.map((record: any) => ({
        id: record.id,
        name: record.name,
        type: record.type,
        delivered: !!record.delivered_at,
        delivered_at: record.delivered_at,
        delivered_by: record.delivered_by
      }))
    }

    return { success: true, exportData }
  } catch (error) {
    console.error('Error exporting RMP status:', error)
    return { success: false, error: 'Failed to export RMP status' }
  }
}

export async function validateRMPCompliance(rmpId: string, jurisdiction: string) {
  try {
    const rmpResult = await pool.query(`
      SELECT a.* FROM public.asset_heads a
      WHERE a.id = $1
    `, [rmpId])

    if (rmpResult.rows.length === 0) {
      return { success: false, error: 'RMP not found' }
    }

    const rmp = rmpResult.rows[0]
    const records = rmp.content.identified_records || []

    // Jurisdiction-specific validation rules
    const validationRules = {
      NSW: {
        required_records: ['quality_records', 'test_results', 'inspection_reports'],
        minimum_completion: 95
      },
      QLD: {
        required_records: ['lot_register', 'conformance_reports', 'as_constructed'],
        minimum_completion: 100
      },
      VIC: {
        required_records: ['quality_records', 'compliance_reports'],
        minimum_completion: 90
      }
    }

    const rules = validationRules[jurisdiction as keyof typeof validationRules] || validationRules.NSW
    const deliveredCount = records.filter((record: any) => record.delivered_at).length
    const completionPercentage = records.length > 0 ? (deliveredCount / records.length) * 100 : 0

    const requiredRecordsPresent = rules.required_records.every((requiredType: string) =>
      records.some((record: any) => record.type === requiredType)
    )

    const validationResult: {
      compliant: boolean
      completion_percentage: number
      required_records_present: boolean
      missing_records: string[]
      recommendations: string[]
    } = {
      compliant: completionPercentage >= (rules.minimum_completion as number) && requiredRecordsPresent,
      completion_percentage: completionPercentage,
      required_records_present: requiredRecordsPresent,
      missing_records: (rules.required_records as string[]).filter((requiredType: string) =>
        !records.some((record: any) => record.type === requiredType)
      ),
      recommendations: [] as string[]
    }

    if (completionPercentage < rules.minimum_completion) {
      validationResult.recommendations.push(`Complete ${rules.minimum_completion - completionPercentage}% more records`)
    }

    if (!requiredRecordsPresent) {
      validationResult.recommendations.push('Add missing required record types')
    }

    return { success: true, validation: validationResult }
  } catch (error) {
    console.error('Error validating RMP compliance:', error)
    return { success: false, error: 'Failed to validate RMP compliance' }
  }
}