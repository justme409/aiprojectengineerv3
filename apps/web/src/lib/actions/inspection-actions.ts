import { query } from '@/lib/db'
import { upsertAssetsAndEdges } from '@/lib/actions/graph-repo'
import { RelationshipEdgeType } from '@/types/graph'

export async function createInspectionRequest(input: {
	project_id: string
	checkpoint_id: string
	lot_asset_id: string
	wbs_node_asset_id: string
	lbs_node_asset_id: string
	sla_hours: number
	requested_for: string
	scheduled_at: string
	acceptance_notes: string
}) {
	const spec = {
		asset: {
			type: 'inspection_request',
			name: `IR for ${input.checkpoint_id}`,
			project_id: input.project_id,
			content: input
		},
		edges: [
			{
				from_asset_id: '',
				to_asset_id: input.lot_asset_id,
				edge_type: 'EVIDENCES' as RelationshipEdgeType,
				properties: { source: 'inspection_request', timestamp: new Date().toISOString() }
			},
			{
				from_asset_id: '',
				to_asset_id: input.wbs_node_asset_id,
				edge_type: 'COVERS_WBS' as RelationshipEdgeType
			},
			{
				from_asset_id: '',
				to_asset_id: input.lbs_node_asset_id,
				edge_type: 'LOCATED_IN_LBS' as RelationshipEdgeType
			}
		],
		idempotency_key: `ir:${input.project_id}:${input.checkpoint_id}`
	}
	return upsertAssetsAndEdges(spec)
}

export async function getInspections(projectId: string) {
	const { rows } = await query('SELECT * FROM public.assets WHERE project_id=$1 AND type=$2 AND is_current AND NOT is_deleted ORDER BY created_at DESC', [projectId, 'inspection_request'])
	return rows
}

export async function scheduleInspection(id: string, scheduledAt: string, inspectorId: string) {
	const spec = {
		asset: { id },
		edges: [{
			from_asset_id: id,
			to_asset_id: inspectorId,
			edge_type: 'ASSIGNED_TO' as RelationshipEdgeType,
			properties: { scheduled_at: scheduledAt }
		}],
		idempotency_key: `schedule:${id}`
	}
	return upsertAssetsAndEdges(spec)
}

export async function signOffInspection(id: string, signatureData: any, roleAtSigning: string, signedBy: string) {
	const spec = {
		asset: {
			id,
			content: { signature_data: signatureData, role_at_signing: roleAtSigning }
		},
		edges: [{
			from_asset_id: id,
			to_asset_id: signedBy,
			edge_type: 'APPROVED_BY' as RelationshipEdgeType,
			properties: { approved_at: new Date().toISOString() }
		}],
		idempotency_key: `signoff:${id}`
	}
	return upsertAssetsAndEdges(spec)
}
