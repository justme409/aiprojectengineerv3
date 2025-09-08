// Use new LangGraph server port and env var
const BASE_URL = process.env.LANGGRAPH_API_URL || 'http://localhost:2024'

export async function listGraphs(): Promise<string[]> {
	const res = await fetch(`${BASE_URL}/graphs`, { cache: 'no-store' })
	if (!res.ok) throw new Error('Failed to list graphs')
	const data = await res.json()
	return data.graphs || []
}

export async function createThread(): Promise<{ id: string }> {
	const res = await fetch(`${BASE_URL}/threads`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
	if (!res.ok) throw new Error('Failed to create thread')
	return res.json()
}

// Deprecated in favor of threads runs; kept for compatibility
export async function runGraph(graphId: string, body?: any): Promise<{ id: string, status: string }> {
	const res = await fetch(`${BASE_URL}/graphs/${encodeURIComponent(graphId)}/runs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) })
	if (!res.ok) throw new Error('Failed to start graph run')
	return res.json()
}

export async function getRun(runId: string): Promise<any> {
	const res = await fetch(`${BASE_URL}/runs/${encodeURIComponent(runId)}`)
	if (!res.ok) throw new Error('Failed to get run')
	return res.json()
}

// Start a run attached to a thread (preferred when using threads/runs endpoints)
export async function startThreadRun(threadId: string, assistantId: string, input?: any): Promise<{ run_id?: string, id?: string, status: string }> {
	// 2024 server expects assistant_id; include configurable thread_id for checkpointing
	const res = await fetch(`${BASE_URL}/threads/${encodeURIComponent(threadId)}/runs`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			assistant_id: assistantId,
			input: input || {},
			config: { configurable: { thread_id: threadId } }
		})
	})
	if (!res.ok) throw new Error('Failed to start thread run')
	return res.json()
}
