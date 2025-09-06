'use server'

import { pool } from '@/lib/db'
import { upsertAssetsAndEdges } from '@/lib/actions/graph-repo'

export async function createDailyDiary(formData: FormData) {
  try {
    const projectId = formData.get('projectId') as string
    const date = formData.get('date') as string
    const weather = formData.get('weather') as string
    const activities = JSON.parse(formData.get('activities') as string)
    const crews = JSON.parse(formData.get('crews') as string)
    const issues = JSON.parse(formData.get('issues') as string)
    const photos = JSON.parse(formData.get('photos') as string)

    const spec = {
      asset: {
        type: 'daily_diary',
        name: `Daily Diary - ${date}`,
        project_id: projectId,
        content: {
          date,
          weather,
          activities,
          crews,
          issues,
          photos,
          created_at: new Date().toISOString()
        },
        status: 'draft'
      },
      edges: [],
      idempotency_key: `daily_diary:${date}:${projectId}`,
      audit_context: { action: 'create_daily_diary', user_id: 'system' }
    }

    const result = await upsertAssetsAndEdges(spec)
    return { success: true, diaryId: result.id }
  } catch (error) {
    console.error('Error creating daily diary:', error)
    return { success: false, error: 'Failed to create daily diary' }
  }
}

export async function updateDailyDiary(formData: FormData) {
  try {
    const diaryId = formData.get('diaryId') as string
    const updates = JSON.parse(formData.get('updates') as string)

    const spec = {
      asset: {
        id: diaryId,
        content: {
          ...updates,
          updated_at: new Date().toISOString()
        }
      },
      edges: [],
      idempotency_key: `update_daily_diary:${diaryId}`,
      audit_context: { action: 'update_daily_diary', user_id: 'system' }
    }

    await upsertAssetsAndEdges(spec)
    return { success: true }
  } catch (error) {
    console.error('Error updating daily diary:', error)
    return { success: false, error: 'Failed to update daily diary' }
  }
}

export async function createSiteInstruction(formData: FormData) {
  try {
    const projectId = formData.get('projectId') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const priority = formData.get('priority') as string
    const dueDate = formData.get('dueDate') as string
    const assignedTo = JSON.parse(formData.get('assignedTo') as string)
    const attachments = JSON.parse(formData.get('attachments') as string)

    const spec = {
      asset: {
        type: 'site_instruction',
        name: title,
        project_id: projectId,
        content: {
          description,
          priority: priority || 'normal',
          due_date: dueDate,
          assigned_to: assignedTo,
          attachments,
          status: 'issued',
          issued_at: new Date().toISOString()
        },
        status: 'active'
      },
      edges: [],
      idempotency_key: `site_instruction:${title}:${projectId}`,
      audit_context: { action: 'create_site_instruction', user_id: 'system' }
    }

    const result = await upsertAssetsAndEdges(spec)
    return { success: true, instructionId: result.id }
  } catch (error) {
    console.error('Error creating site instruction:', error)
    return { success: false, error: 'Failed to create site instruction' }
  }
}

export async function updateSiteInstruction(formData: FormData) {
  try {
    const instructionId = formData.get('instructionId') as string
    const updates = JSON.parse(formData.get('updates') as string)

    const spec = {
      asset: {
        id: instructionId,
        content: {
          ...updates,
          updated_at: new Date().toISOString()
        }
      },
      edges: [],
      idempotency_key: `update_site_instruction:${instructionId}`,
      audit_context: { action: 'update_site_instruction', user_id: 'system' }
    }

    await upsertAssetsAndEdges(spec)
    return { success: true }
  } catch (error) {
    console.error('Error updating site instruction:', error)
    return { success: false, error: 'Failed to update site instruction' }
  }
}

export async function logPlantPrestart(formData: FormData) {
  try {
    const projectId = formData.get('projectId') as string
    const equipmentId = formData.get('equipmentId') as string
    const operatorId = formData.get('operatorId') as string
    const prestartChecks = JSON.parse(formData.get('prestartChecks') as string)
    const issues = JSON.parse(formData.get('issues') as string)

    const spec = {
      asset: {
        type: 'plant_prestart',
        name: `Prestart Check - ${equipmentId}`,
        project_id: projectId,
        content: {
          equipment_id: equipmentId,
          operator_id: operatorId,
          prestart_checks: prestartChecks,
          issues,
          check_date: new Date().toISOString(),
          status: issues.length > 0 ? 'issues_found' : 'passed'
        },
        status: 'completed'
      },
      edges: [],
      idempotency_key: `plant_prestart:${equipmentId}:${new Date().toISOString().split('T')[0]}`,
      audit_context: { action: 'log_plant_prestart', user_id: 'system' }
    }

    const result = await upsertAssetsAndEdges(spec)
    return { success: true, prestartId: result.id }
  } catch (error) {
    console.error('Error logging plant prestart:', error)
    return { success: false, error: 'Failed to log plant prestart' }
  }
}

export async function recordMaintenance(formData: FormData) {
  try {
    const projectId = formData.get('projectId') as string
    const equipmentId = formData.get('equipmentId') as string
    const maintenanceType = formData.get('maintenanceType') as string
    const description = formData.get('description') as string
    const performedBy = formData.get('performedBy') as string
    const downtime = parseFloat(formData.get('downtime') as string)
    const parts = JSON.parse(formData.get('parts') as string)

    const spec = {
      asset: {
        type: 'maintenance_record',
        name: `${maintenanceType} - ${equipmentId}`,
        project_id: projectId,
        content: {
          equipment_id: equipmentId,
          maintenance_type: maintenanceType,
          description,
          performed_by: performedBy,
          downtime_hours: downtime,
          parts_used: parts,
          maintenance_date: new Date().toISOString(),
          status: 'completed'
        },
        status: 'completed'
      },
      edges: [],
      idempotency_key: `maintenance:${equipmentId}:${maintenanceType}:${new Date().toISOString()}`,
      audit_context: { action: 'record_maintenance', user_id: 'system' }
    }

    const result = await upsertAssetsAndEdges(spec)
    return { success: true, maintenanceId: result.id }
  } catch (error) {
    console.error('Error recording maintenance:', error)
    return { success: false, error: 'Failed to record maintenance' }
  }
}

export async function logUtilization(formData: FormData) {
  try {
    const projectId = formData.get('projectId') as string
    const equipmentId = formData.get('equipmentId') as string
    const operatorId = formData.get('operatorId') as string
    const hours = parseFloat(formData.get('hours') as string)
    const activity = formData.get('activity') as string
    const fuelUsed = parseFloat(formData.get('fuelUsed') as string)

    const spec = {
      asset: {
        type: 'utilization_log',
        name: `Utilization - ${equipmentId}`,
        project_id: projectId,
        content: {
          equipment_id: equipmentId,
          operator_id: operatorId,
          hours_used: hours,
          activity,
          fuel_used: fuelUsed,
          log_date: new Date().toISOString().split('T')[0],
          status: 'logged'
        },
        status: 'completed'
      },
      edges: [],
      idempotency_key: `utilization:${equipmentId}:${new Date().toISOString().split('T')[0]}`,
      audit_context: { action: 'log_utilization', user_id: 'system' }
    }

    const result = await upsertAssetsAndEdges(spec)
    return { success: true, logId: result.id }
  } catch (error) {
    console.error('Error logging utilization:', error)
    return { success: false, error: 'Failed to log utilization' }
  }
}

export async function getFieldAssets(projectId: string, type?: string) {
  try {
    let query = `
      SELECT a.* FROM public.asset_heads a
      WHERE a.project_id = $1
    `
    const params = [projectId]

    if (type) {
      query += ` AND a.content->>'asset_type' = $2`
      params.push(type)
    } else {
      query += ` AND a.type IN ('equipment', 'personnel', 'material')`
    }

    query += ` ORDER BY a.created_at DESC`

    const result = await pool.query(query, params)

    return { success: true, assets: result.rows }
  } catch (error) {
    console.error('Error fetching field assets:', error)
    return { success: false, error: 'Failed to fetch field assets' }
  }
}

export async function createRoster(formData: FormData) {
  try {
    const projectId = formData.get('projectId') as string
    const personnel = JSON.parse(formData.get('personnel') as string)
    const shift = formData.get('shift') as string
    const date = formData.get('date') as string

    const spec = {
      asset: {
        type: 'roster',
        name: `Roster - ${date} ${shift}`,
        project_id: projectId,
        content: {
          personnel,
          shift,
          date,
          created_at: new Date().toISOString(),
          status: 'active'
        },
        status: 'active'
      },
      edges: [],
      idempotency_key: `roster:${date}:${shift}:${projectId}`,
      audit_context: { action: 'create_roster', user_id: 'system' }
    }

    const result = await upsertAssetsAndEdges(spec)
    return { success: true, rosterId: result.id }
  } catch (error) {
    console.error('Error creating roster:', error)
    return { success: false, error: 'Failed to create roster' }
  }
}

export async function createTimesheet(formData: FormData) {
  try {
    const projectId = formData.get('projectId') as string
    const personnelId = formData.get('personnelId') as string
    const date = formData.get('date') as string
    const hours = parseFloat(formData.get('hours') as string)
    const activity = formData.get('activity') as string
    const equipmentId = formData.get('equipmentId') as string

    const spec = {
      asset: {
        type: 'timesheet',
        name: `Timesheet - ${personnelId} ${date}`,
        project_id: projectId,
        content: {
          personnel_id: personnelId,
          date,
          hours,
          activity,
          equipment_id: equipmentId,
          created_at: new Date().toISOString(),
          status: 'pending'
        },
        status: 'active'
      },
      edges: [],
      idempotency_key: `timesheet:${personnelId}:${date}:${projectId}`,
      audit_context: { action: 'create_timesheet', user_id: 'system' }
    }

    const result = await upsertAssetsAndEdges(spec)
    return { success: true, timesheetId: result.id }
  } catch (error) {
    console.error('Error creating timesheet:', error)
    return { success: false, error: 'Failed to create timesheet' }
  }
}