const BASE_URL = process.env.LANGGRAPH_V10_BASE_URL || 'http://localhost:8777'

export async function listGraphs(): Promise<string[]> {
	const res = await fetch(`${BASE_URL}/v10/graphs`, { cache: 'no-store' })
	if (!res.ok) throw new Error('Failed to list graphs')
	const data = await res.json()
	return data.graphs || []
}

export async function createThread(): Promise<{ id: string }> {
	const res = await fetch(`${BASE_URL}/v10/threads`, { method: 'POST' })
	if (!res.ok) throw new Error('Failed to create thread')
	return res.json()
}

export async function runGraph(graphId: string, body?: any): Promise<{ id: string, status: string }> {
	const res = await fetch(`${BASE_URL}/v10/graphs/${encodeURIComponent(graphId)}/runs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) })
	if (!res.ok) throw new Error('Failed to start graph run')
	return res.json()
}

export async function getRun(runId: string): Promise<any> {
	const res = await fetch(`${BASE_URL}/v10/runs/${encodeURIComponent(runId)}`)
	if (!res.ok) throw new Error('Failed to get run')
	return res.json()
}
