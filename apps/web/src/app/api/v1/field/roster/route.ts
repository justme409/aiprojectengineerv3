import { NextRequest } from 'next/server'
import { createRoster, getFieldAssets } from '@/lib/actions/field-actions'

export async function GET(req: NextRequest) {
	const projectId = new URL(req.url).searchParams.get('project_id')
	const date = new URL(req.url).searchParams.get('date')

	if (!projectId) return new Response('project_id required', { status: 400 })

	let rosters = await getFieldAssets(projectId, 'roster')

	// Filter by date if specified
	if (date) {
		rosters = rosters.filter(r => r.content?.date === date)
	}

	return Response.json({ data: rosters })
}

export async function POST(req: NextRequest) {
	const body = await req.json()
	const result = await createRoster(body)
	return Response.json(result)
}
