import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function GET(req: NextRequest, { params }: { params: { projectId: string } }) {
	const projectId = params.projectId
	const base = process.env.LANGGRAPH_V10_BASE_URL || 'http://localhost:8777'
	const runId = req.nextUrl.searchParams.get('run_id')
	if (!runId) return new Response('run_id required', { status: 400 })
	const target = `${base}/v10/runs/${encodeURIComponent(runId)}/events`
	const upstream = await fetch(target, { headers: { Accept: 'text/event-stream' } })
	return new Response(upstream.body, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	})
}
