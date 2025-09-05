import { query } from '@/lib/db'
import { upsertAssetsAndEdges } from '@/lib/actions/graph-repo'

export async function createDailyDiary(input: {
	project_id: string
	date: string
	weather: string
	crews: string[]
	activities: string[]
	issues: string[]
	photos: string[]
	location_lbs_node_id?: string
}) {
	const spec = {
		asset: {
			type: 'daily_diary',
			name: `Daily Diary - ${input.date}`,
			project_id: input.project_id,
			content: input
		},
		edges: input.location_lbs_node_id ? [{
			from_asset_id: '',
			to_asset_id: input.location_lbs_node_id,
			edge_type: 'LOCATED_IN_LBS'
		}] : [],
		idempotency_key: `daily_diary:${input.project_id}:${input.date}`
	}
	return upsertAssetsAndEdges(spec)
}

export async function updateDailyDiary(diaryAssetId: string, updates: Partial<{
	weather: string
	crews: string[]
	activities: string[]
	issues: string[]
	photos: string[]
}>) {
	const spec = {
		asset: {
			id: diaryAssetId,
			content: updates
		},
		idempotency_key: `update_diary:${diaryAssetId}`
	}
	return upsertAssetsAndEdges(spec)
}

export async function createSiteInstruction(input: {
	project_id: string
	title: string
	description: string
	priority: 'low' | 'medium' | 'high' | 'critical'
	due_date: string
	assigned_to: string[]
	issued_by: string
	location_lbs_node_id?: string
}) {
	const spec = {
		asset: {
			type: 'site_instruction',
			name: input.title,
			project_id: input.project_id,
			content: input
		},
		edges: [
			{
				from_asset_id: '',
				to_asset_id: input.issued_by,
				edge_type: 'OWNED_BY'
			},
			...(input.location_lbs_node_id ? [{
				from_asset_id: '',
				to_asset_id: input.location_lbs_node_id,
				edge_type: 'LOCATED_IN_LBS'
			}] : []),
			...input.assigned_to.map(userId => ({
				from_asset_id: '',
				to_asset_id: userId,
				edge_type: 'ASSIGNED_TO'
			}))
		],
		idempotency_key: `site_instruction:${input.project_id}:${input.title}`
	}
	return upsertAssetsAndEdges(spec)
}

export async function createTimesheet(input: {
	project_id: string
	user_id: string
	date: string
	hours_worked: number
	activities: string[]
	equipment_used: string[]
	approved_by?: string
}) {
	const spec = {
		asset: {
			type: 'timesheet',
			name: `Timesheet - ${input.user_id} - ${input.date}`,
			project_id: input.project_id,
			content: input
		},
		edges: input.approved_by ? [{
			from_asset_id: '',
			to_asset_id: input.approved_by,
			edge_type: 'APPROVED_BY',
			properties: { approved_at: new Date().toISOString() }
		}] : [],
		idempotency_key: `timesheet:${input.project_id}:${input.user_id}:${input.date}`
	}
	return upsertAssetsAndEdges(spec)
}

export async function createRoster(input: {
	project_id: string
	date: string
	shifts: Array<{
		user_id: string
		start_time: string
		end_time: string
		role: string
		location?: string
	}>
}) {
	const spec = {
		asset: {
			type: 'roster',
			name: `Roster - ${input.date}`,
			project_id: input.project_id,
			content: input
		},
		idempotency_key: `roster:${input.project_id}:${input.date}`
	}
	return upsertAssetsAndEdges(spec)
}

export async function logPlantPrestart(input: {
	project_id: string
	plant_id: string
	operator: string
	date: string
	prestart_checks: Array<{
		check_item: string
		status: 'pass' | 'fail'
		notes?: string
	}>
	issues_found: string[]
	approved_to_operate: boolean
}) {
	const spec = {
		asset: {
			type: 'plant_prestart',
			name: `Plant Prestart - ${input.plant_id} - ${input.date}`,
			project_id: input.project_id,
			content: input
		},
		edges: [{
			from_asset_id: '',
			to_asset_id: input.operator,
			edge_type: 'REPORTED_BY',
			properties: { reported_at: new Date().toISOString() }
		}],
		idempotency_key: `plant_prestart:${input.project_id}:${input.plant_id}:${input.date}`
	}
	return upsertAssetsAndEdges(spec)
}

export async function recordMaintenance(input: {
	project_id: string
	plant_id: string
	maintenance_type: 'preventive' | 'corrective' | 'breakdown'
	description: string
	technician: string
	date: string
	duration_hours: number
	parts_used: Array<{
		part_name: string
		part_number: string
		quantity: number
	}>
	next_service_due?: string
}) {
	const spec = {
		asset: {
			type: 'maintenance_record',
			name: `Maintenance - ${input.plant_id} - ${input.date}`,
			project_id: input.project_id,
			content: input
		},
		edges: [{
			from_asset_id: '',
			to_asset_id: input.technician,
			edge_type: 'REPORTED_BY',
			properties: { reported_at: new Date().toISOString() }
		}],
		idempotency_key: `maintenance:${input.project_id}:${input.plant_id}:${input.date}`
	}
	return upsertAssetsAndEdges(spec)
}

export async function logUtilization(input: {
	project_id: string
	plant_id: string
	date: string
	hours_operated: number
	fuel_used?: number
	location_lbs_node_id?: string
	operator: string
	work_performed: string[]
}) {
	const spec = {
		asset: {
			type: 'utilization_log',
			name: `Utilization - ${input.plant_id} - ${input.date}`,
			project_id: input.project_id,
			content: input
		},
		edges: [
			{
				from_asset_id: '',
				to_asset_id: input.operator,
				edge_type: 'REPORTED_BY',
				properties: { reported_at: new Date().toISOString() }
			},
			...(input.location_lbs_node_id ? [{
				from_asset_id: '',
				to_asset_id: input.location_lbs_node_id,
				edge_type: 'LOCATED_IN_LBS'
			}] : [])
		],
		idempotency_key: `utilization:${input.project_id}:${input.plant_id}:${input.date}`
	}
	return upsertAssetsAndEdges(spec)
}

export async function getFieldAssets(projectId: string, type: string) {
	const { rows } = await query('SELECT * FROM public.assets WHERE project_id=$1 AND type=$2 AND is_current AND NOT is_deleted ORDER BY created_at DESC', [projectId, type])
	return rows
}
