import { query } from '@/lib/db'
import { upsertAssetsAndEdges } from '@/lib/actions/graph-repo'
import { RelationshipEdgeType } from '@/types/graph'

export async function createSwms(input: {
	project_id: string
	name: string
	hazards: string[]
	controls: string[]
	roles_required: string[]
	expiry_date: string
}) {
	const spec = {
		asset: {
			type: 'swms',
			name: input.name,
			project_id: input.project_id,
			content: input
		},
		idempotency_key: `swms:${input.project_id}:${input.name}`
	}
	return upsertAssetsAndEdges(spec)
}

export async function getHSEAssets(projectId: string, type: string) {
	const { rows } = await query('SELECT * FROM public.assets WHERE project_id=$1 AND type=$2 AND is_current AND NOT is_deleted ORDER BY created_at DESC', [projectId, type])
	return rows
}

export async function issuePermit(input: {
	project_id: string
	name: string
	work_description: string
	hazards: string[]
	controls: string[]
	issuer: string
	expiry_date: string
}) {
	const spec = {
		asset: {
			type: 'permit',
			name: input.name,
			project_id: input.project_id,
			content: input
		},
		edges: [{
			from_asset_id: '',
			to_asset_id: input.issuer,
			edge_type: 'APPROVED_BY' as RelationshipEdgeType,
			properties: { approved_at: new Date().toISOString() }
		}],
		idempotency_key: `permit:${input.project_id}:${input.name}`
	}
	return upsertAssetsAndEdges(spec)
}

export async function logToolboxTalk(input: {
	project_id: string
	topic: string
	attendees: string[]
	key_points: string[]
	conductor: string
	date: string
}) {
	const spec = {
		asset: {
			type: 'toolbox_talk',
			name: `Toolbox Talk: ${input.topic}`,
			project_id: input.project_id,
			content: input
		},
		edges: [{
			from_asset_id: '',
			to_asset_id: input.conductor,
			edge_type: 'OWNED_BY' as RelationshipEdgeType
		}],
		idempotency_key: `toolbox:${input.project_id}:${input.date}:${input.topic}`
	}
	return upsertAssetsAndEdges(spec)
}

export async function recordIncident(input: {
	project_id: string
	category: string
	severity: string
	description: string
	root_cause: string
	corrective_actions: string[]
	reported_by: string
}) {
	const spec = {
		asset: {
			type: 'incident',
			name: `${input.category} Incident`,
			project_id: input.project_id,
			content: input
		},
		edges: [{
			from_asset_id: '',
			to_asset_id: input.reported_by,
			edge_type: 'REPORTED_BY' as RelationshipEdgeType,
			properties: { reported_at: new Date().toISOString() }
		}],
		idempotency_key: `incident:${input.project_id}:${Date.now()}`
	}
	return upsertAssetsAndEdges(spec)
}
