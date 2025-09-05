import { NextRequest } from 'next/server'
import { createDailyDiary, updateDailyDiary, getFieldAssets } from '@/lib/actions/field-actions'

export async function GET(req: NextRequest) {
	const projectId = new URL(req.url).searchParams.get('project_id')
	if (!projectId) return new Response('project_id required', { status: 400 })
	const diaries = await getFieldAssets(projectId, 'daily_diary')
	return Response.json({ data: diaries })
}

export async function POST(req: NextRequest) {
	const body = await req.json()
	const result = await createDailyDiary(body)
	return Response.json(result)
}

export async function PUT(req: NextRequest) {
	const body = await req.json()
	if (body.id && body.updates) {
		const result = await updateDailyDiary(body.id, body.updates)
		return Response.json(result)
	}
	return new Response('Invalid request', { status: 400 })
}
