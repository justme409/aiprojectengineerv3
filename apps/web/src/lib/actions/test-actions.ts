import { query } from '@/lib/db'
import { upsertAssetsAndEdges } from '@/lib/actions/graph-repo'
import { RelationshipEdgeType } from '@/types/graph'

export async function createTestRequest(input: {
	project_id: string
	lot_asset_id: string
	test_method_code: string
	sla_due_at: string
	lab_asset_id?: string
	samples_expected: number
}) {
	const spec = {
		asset: {
			type: 'test_request',
			name: `Test Request for ${input.test_method_code}`,
			project_id: input.project_id,
			content: input
		},
		edges: [
			{
				from_asset_id: '',
				to_asset_id: input.lot_asset_id,
				edge_type: 'EVIDENCES' as RelationshipEdgeType,
				properties: { source: 'test_request', timestamp: new Date().toISOString() }
			},
			...(input.lab_asset_id ? [{
				from_asset_id: '',
				to_asset_id: input.lab_asset_id,
				edge_type: 'RELATED_TO' as RelationshipEdgeType
			}] : [])
		],
		idempotency_key: `test_request:${input.project_id}:${input.lot_asset_id}:${input.test_method_code}`
	}
	return upsertAssetsAndEdges(spec)
}

export async function registerSample(input: {
	project_id: string
	test_request_asset_id: string
	sample_id: string
	chain_of_custody: string
	location_ref: string
	collected_at: string
}) {
	const spec = {
		asset: {
			type: 'sample',
			name: `Sample ${input.sample_id}`,
			project_id: input.project_id,
			content: input
		},
		edges: [{
			from_asset_id: '',
			to_asset_id: input.test_request_asset_id,
			edge_type: 'INPUT_TO' as RelationshipEdgeType
		}],
		idempotency_key: `sample:${input.project_id}:${input.sample_id}`
	}
	return upsertAssetsAndEdges(spec)
}

export async function importLabResults(input: {
	project_id: string
	test_request_asset_id: string
	sample_asset_id: string
	test_method_code: string
	method_version: string
	nata_endorsed: boolean
	lab_asset_id: string
	result_values: any
	pass_fail: string
	report_id: string
	report_date: string
	lab_accreditation_snapshot: any
	test_conditions: any
	measurement_uncertainty: any
	attachments: string[]
}) {
	const spec = {
		asset: {
			type: 'test_result',
			name: `Test Result for ${input.test_method_code}`,
			project_id: input.project_id,
			content: input
		},
		edges: [
			{
				from_asset_id: '',
				to_asset_id: input.test_request_asset_id,
				edge_type: 'OUTPUT_OF' as RelationshipEdgeType
			},
			{
				from_asset_id: '',
				to_asset_id: input.sample_asset_id,
				edge_type: 'GENERATED_FROM' as RelationshipEdgeType
			},
			{
				from_asset_id: '',
				to_asset_id: input.lab_asset_id,
				edge_type: 'EVIDENCES' as RelationshipEdgeType,
				properties: { source: 'lab_result', timestamp: new Date().toISOString() }
			}
		],
		idempotency_key: `test_result:${input.project_id}:${input.report_id}`
	}
	return upsertAssetsAndEdges(spec)
}

export async function evaluateConformance(testResultAssetId: string, acceptanceCriteria: any) {
	// This would typically trigger the conformance checker graph
	// For now, return a placeholder response
	return {
		conformance_status: 'pending_evaluation',
		test_result_id: testResultAssetId,
		acceptance_criteria: acceptanceCriteria
	}
}

export async function getTestRequests(projectId: string) {
	const { rows } = await query('SELECT * FROM public.assets WHERE project_id=$1 AND type=$2 AND is_current AND NOT is_deleted ORDER BY created_at DESC', [projectId, 'test_request'])
	return rows
}

export async function getTestResults(projectId: string) {
	const { rows } = await query('SELECT * FROM public.assets WHERE project_id=$1 AND type=$2 AND is_current AND NOT is_deleted ORDER BY created_at DESC', [projectId, 'test_result'])
	return rows
}

export async function getSamples(projectId: string) {
	const { rows } = await query('SELECT * FROM public.assets WHERE project_id=$1 AND type=$2 AND is_current AND NOT is_deleted ORDER BY created_at DESC', [projectId, 'sample'])
	return rows
}
