import { NextRequest } from 'next/server'
import { query } from '@/lib/db'
import { getProcessingStatusFromLangGraph } from '@/lib/actions/langgraph-actions'

export async function GET(req: NextRequest, { params }: { params: { projectId: string } }) {
	const runId = new URL(req.url).searchParams.get('run_id')
	if (!runId) {
		const { rows } = await query('SELECT * FROM public.processing_runs WHERE project_id=$1 ORDER BY started_at DESC LIMIT 1', [params.projectId])
		return Response.json({ latest: rows[0] || null })
	}
	const status = await getProcessingStatusFromLangGraph(runId)
	return Response.json({ status })
}
