import { query } from '@/lib/db'
import { createThread, startThreadRun, getRun } from '@/lib/actions/langgraph-server-actions'
import { upsertAssetsAndEdges } from '@/lib/actions/graph-repo'

/**
 * Assistant selection notes (LangGraph 2024):
 * - The LangGraph server maps assistant_id values to graph entries declared in
 *   `services/langgraphv10/langgraph.json` (the object keys, e.g. "agent", "wbs_extraction").
 * - Passing an assistant_id equal to one of those graph keys will be resolved by the server
 *   to a canonical assistant UUID and returned in the run response.
 * - Do NOT hardcode assistant names in these shared server actions; graph keys can change.
 *   Pages/feature entrypoints should specify which assistant to invoke (e.g. a future
 *   assistant named "new project"). This action only requires the assistant_id provided
 *   by the caller and should remain generic.
 * - If you add a new assistant/graph: update `langgraph.json`, deploy/restart the
 *   LangGraph service, then pass the new key as assistant_id at invocation time.
 */

export async function triggerProjectProcessingViaLangGraphEnhanced(projectId: string, _documentIds?: string[]) {
	// 1) Create a thread on LangGraph 2024
	const thread = await createThread()
	const threadId = (thread as any)?.id ?? (thread as any)?.thread_id

	// 2) Start a run on that thread using ONLY the project id (assistant_id required by 2024 server)
	const run = await startThreadRun(threadId, 'orchestrator', { project_id: projectId })
	const runId = (run as any)?.id ?? (run as any)?.run_id
	const runStatus = (run as any)?.status

	// Record processing run row
	const inserted = await query(
		`INSERT INTO public.processing_runs (id, run_uid, project_id, agent_id, model, prompt_hash, params, thread_id, run_id, status)
		 VALUES (gen_random_uuid(), gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8)
		 RETURNING run_uid`,
		[projectId, 'langgraph_2024', 'orchestrator', 'hash:na', { graph: 'orchestrator' }, threadId, runId, runStatus]
	)
	const run_uid: string = inserted.rows?.[0]?.run_uid

	// 3) Create a processing_run asset and link project context for provenance
	const processingRunSpec = {
		asset: {
			type: 'processing_run',
			name: 'LangGraph Processing Run',
			project_id: projectId,
			content: {
				thread_id: threadId,
				run_id: runId,
				graph: 'orchestrator',
			},
			status: 'draft',
		},
		edges: [],
		idempotency_key: `processing_run:${runId}`,
		audit_context: { action: 'trigger_processing_run' },
	} as any

	const pr = await upsertAssetsAndEdges(processingRunSpec)
	const processingRunAssetId = pr.id

	// Link project context only (no document INPUT_TO edges)
	await upsertAssetsAndEdges({
		asset: { id: projectId },
		idempotency_key: `NOOP-${projectId}`,
		edges: [
			{
				from_asset_id: projectId as any,
				to_asset_id: processingRunAssetId as any,
				edge_type: 'CONTEXT_FOR',
				idempotency_key: `CONTEXT_FOR:${projectId}:${runId}`,
				properties: {},
			},
		],
	})

	// Return identifiers; client streams via API route using run_uid
	return { thread_id: threadId, run_id: runId, run_uid, processing_run_asset_id: processingRunAssetId }
}

export async function getProcessingStatusFromLangGraph(runId: string) {
	return getRun(runId)
}

export async function recordProcessingRun(run: any) {
	await query(`UPDATE public.processing_runs SET status=$2, ended_at=CASE WHEN $2='completed' THEN now() ELSE ended_at END WHERE run_id=$1`, [run.id, run.status])
}

export async function linkRunInputsOutputs(processingRunAssetId: string, inputAssetIds: string[], outputAssetIds: string[]) {
	for (const id of inputAssetIds) {
		await upsertAssetsAndEdges({
			asset: { id },
			idempotency_key: `NOOP-${id}`,
			edges: [
				{ from_asset_id: id, to_asset_id: processingRunAssetId as any, edge_type: 'INPUT_TO', idempotency_key: `INPUT_TO:${id}:${processingRunAssetId}` },
			],
		})
	}
	for (const id of outputAssetIds) {
		await upsertAssetsAndEdges({
			asset: { id },
			idempotency_key: `NOOP-${id}`,
			edges: [
				{ from_asset_id: id, to_asset_id: processingRunAssetId as any, edge_type: 'OUTPUT_OF', idempotency_key: `OUTPUT_OF:${id}:${processingRunAssetId}` },
			],
		})
	}
}
