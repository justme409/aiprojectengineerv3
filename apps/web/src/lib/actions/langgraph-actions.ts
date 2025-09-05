import { query } from '@/lib/db'
import { createThread, runGraph, getRun } from '@/lib/actions/langgraph-server-actions'
import { upsertAssetsAndEdges } from '@/lib/actions/graph-repo'

export async function triggerProjectProcessingViaLangGraphEnhanced(projectId: string, documentIds?: string[]) {
	const thread = await createThread()
	const run = await runGraph('orchestrator', { project_id: projectId, document_ids: documentIds || [] })
	await query(
		`INSERT INTO public.processing_runs (id, run_uid, project_id, agent_id, model, prompt_hash, params, thread_id, run_id, status)
		 VALUES (gen_random_uuid(), gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8)`,
		[projectId, 'langgraph_v10', 'orchestrator', 'hash:na', { graph: 'orchestrator' }, thread.id, run.id, run.status]
	)
	return { thread_id: thread.id, run_id: run.id }
}

export async function getProcessingStatusFromLangGraph(runId: string) {
	return getRun(runId)
}

export async function recordProcessingRun(run: any) {
	await query(`UPDATE public.processing_runs SET status=$2, ended_at=CASE WHEN $2='completed' THEN now() ELSE ended_at END WHERE run_id=$1`, [run.id, run.status])
}

export async function linkRunInputsOutputs(runId: string, inputAssetIds: string[], outputAssetIds: string[]) {
	for (const id of inputAssetIds) {
		await upsertAssetsAndEdges({ asset: { id }, idempotency_key: `NOOP-${id}`, edges: [{ from_asset_id: id, to_asset_id: runId as any, edge_type: 'INPUT_TO', idempotency_key: `INPUT_TO:${id}:${runId}` }] })
	}
	for (const id of outputAssetIds) {
		await upsertAssetsAndEdges({ asset: { id }, idempotency_key: `NOOP-${id}`, edges: [{ from_asset_id: id, to_asset_id: runId as any, edge_type: 'OUTPUT_OF', idempotency_key: `OUTPUT_OF:${id}:${runId}` }] })
	}
}
