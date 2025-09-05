import { query } from '@/lib/db'
import { upsertAssetsAndEdges } from '@/lib/actions/graph-repo'

export async function createMaterialApproval(input: {
	project_id: string
	name: string
	specification: string
	quantity: number
	supplier: string
}) {
	const spec = {
		asset: {
			type: 'material',
			name: `${input.name} Approval`,
			project_id: input.project_id,
			content: input
		},
		idempotency_key: `material:${input.project_id}:${input.name}:${Date.now()}`
	}
	return upsertAssetsAndEdges(spec)
}

export async function getMaterials(projectId: string) {
	const { rows } = await query('SELECT * FROM public.assets WHERE project_id=$1 AND type=$2 AND is_current AND NOT is_deleted ORDER BY created_at DESC', [projectId, 'material'])
	return rows
}

export async function approveMaterial(id: string, approvedBy: string, approvalDate: string) {
	const spec = {
		asset: {
			id,
			approval_state: 'approved'
		},
		edges: [{
			from_asset_id: id,
			to_asset_id: approvedBy,
			edge_type: 'APPROVED_BY',
			properties: { approved_at: approvalDate }
		}],
		idempotency_key: `approve:${id}`
	}
	return upsertAssetsAndEdges(spec)
}

export async function attachBatchTicket(materialId: string, batchTicketData: any) {
	const spec = {
		asset: {
			type: 'batch_ticket',
			name: `Batch Ticket for ${materialId}`,
			project_id: '', // Will be set from material
			content: batchTicketData,
			parent_asset_id: materialId
		},
		edges: [{
			from_asset_id: '', // Will be set to batch ticket asset
			to_asset_id: materialId,
			edge_type: 'EVIDENCES',
			properties: { source: 'batch_ticket', timestamp: new Date().toISOString() }
		}],
		idempotency_key: `batch_ticket:${materialId}:${Date.now()}`
	}
	return upsertAssetsAndEdges(spec)
}
