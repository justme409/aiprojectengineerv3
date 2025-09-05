import { query } from '@/lib/db'
import { upsertAssetsAndEdges } from '@/lib/actions/graph-repo'

export async function createPrimaryTestingContract(projectId: string, contractData: any) {
  const result = await upsertAssetsAndEdges({
    asset: {
      type: 'contract',
      name: `Primary Testing Contract ${contractData.contract_number}`,
      project_id: projectId,
      content: {
        contract_number: contractData.contract_number,
        contract_type: 'primary_testing',
        contractor_name: contractData.contractor_name,
        lab_name: contractData.lab_name,
        lab_asset_id: contractData.lab_asset_id,
        scope_of_testing: contractData.scope_of_testing,
        testing_frequency: contractData.testing_frequency,
        contract_value: contractData.contract_value,
        start_date: contractData.start_date,
        end_date: contractData.end_date,
        accreditation_requirements: contractData.accreditation_requirements,
        status: 'active'
      }
    },
    idempotency_key: `primary_contract:${projectId}:${contractData.contract_number}`
  })

  return result
}

export async function assignLab(projectId: string, contractId: string, labData: any) {
  const result = await upsertAssetsAndEdges({
    asset: {
      type: 'record',
      name: `Lab Assignment - ${labData.lab_name}`,
      project_id: projectId,
      content: {
        contract_asset_id: contractId,
        lab_asset_id: labData.lab_asset_id,
        lab_name: labData.lab_name,
        assigned_at: new Date().toISOString(),
        assignment_notes: labData.assignment_notes,
        assignment_type: 'primary_testing'
      }
    },
    idempotency_key: `lab_assignment:${projectId}:${contractId}`
  })

  return result
}

export async function schedulePrimaryTest(projectId: string, scheduleData: any) {
  const result = await upsertAssetsAndEdges({
    asset: {
      type: 'test_request',
      name: `${scheduleData.test_method} - ${scheduleData.sample_location}`,
      project_id: projectId,
      content: {
        test_type: 'primary',
        contract_asset_id: scheduleData.contract_asset_id,
        lab_asset_id: scheduleData.lab_asset_id,
        lab_name: scheduleData.lab_name,
        test_method: scheduleData.test_method,
        sample_location: scheduleData.sample_location,
        scheduled_at: scheduleData.scheduled_at,
        priority: scheduleData.priority || 'normal',
        special_instructions: scheduleData.special_instructions,
        status: 'scheduled'
      }
    },
    idempotency_key: `primary_test:${projectId}:${scheduleData.test_method}:${Date.now()}`
  })

  return result
}

export async function getPrimaryTestingContracts(projectId: string) {
  const contracts = await query(`
    SELECT a.* FROM public.assets a
    WHERE a.project_id = $1
      AND a.type = 'contract'
      AND a.content->>'contract_type' = 'primary_testing'
      AND a.is_current AND NOT a.is_deleted
    ORDER BY a.created_at DESC
  `, [projectId])

  return contracts.rows
}

export async function getAccreditedLabs() {
  const labs = await query(`
    SELECT a.* FROM public.assets a
    WHERE a.type = 'lab'
      AND a.is_current AND NOT a.is_deleted
    ORDER BY a.name
  `)

  return labs.rows
}

export async function getTestSchedule(projectId: string) {
  const schedule = await query(`
    SELECT a.* FROM public.assets a
    WHERE a.project_id = $1
      AND a.type = 'test_request'
      AND a.content->>'test_type' = 'primary'
      AND a.is_current AND NOT a.is_deleted
    ORDER BY a.content->>'scheduled_at' ASC
  `, [projectId])

  return schedule.rows
}

export async function updateTestStatus(projectId: string, testId: string, statusData: any) {
  const result = await upsertAssetsAndEdges({
    asset: {
      id: testId,
      content: {
        status: statusData.status,
        status_updated_at: new Date().toISOString(),
        status_notes: statusData.notes,
        completed_at: statusData.status === 'completed' ? new Date().toISOString() : undefined
      }
    },
    idempotency_key: `update_test_status:${testId}`
  })

  return result
}

export async function validateLabAccreditation(labId: string) {
  const lab = await query(`
    SELECT * FROM public.assets
    WHERE id = $1 AND type = 'lab' AND is_current AND NOT is_deleted
  `, [labId])

  if (lab.rows.length === 0) {
    throw new Error('Lab not found')
  }

  const labData = lab.rows[0]
  const accreditationExpiry = labData.content?.accreditation_expiry
  const nataScope = labData.content?.nata_scope_url

  const validation = {
    lab_id: labId,
    lab_name: labData.name,
    is_accredited: !!accreditationExpiry,
    accreditation_expiry: accreditationExpiry,
    has_nata_scope: !!nataScope,
    nata_scope_url: nataScope,
    accreditation_valid: accreditationExpiry ? new Date(accreditationExpiry) > new Date() : false,
    validation_date: new Date().toISOString()
  }

  return validation
}
