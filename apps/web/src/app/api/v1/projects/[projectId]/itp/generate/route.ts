import { NextRequest } from 'next/server'
import { runGraph } from '@/lib/actions/langgraph-server-actions'
import { query } from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: { projectId: string } }) {
	const { projectId } = params
	try {
		const run = await runGraph('itp_generation', { project_id: projectId })
		await query(
			`INSERT INTO public.processing_runs (id, run_uid, project_id, agent_id, model, prompt_hash, params, thread_id, run_id, status)
			 VALUES (gen_random_uuid(), gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8)`,
			[projectId, 'langgraph_v10', 'itp_generation', 'hash:na', { graph: 'itp_generation' }, null, run.id, run.status]
		)
		return Response.json({ run_id: run.id, status: run.status })
	} catch (e: any) {
		return new Response(e?.message || 'Failed to start ITP generation', { status: 500 })
	}
}


