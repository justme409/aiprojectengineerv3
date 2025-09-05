import { NextRequest } from 'next/server'
import { createInspectionRequest, getInspections } from '@/lib/actions/inspection-actions'

export async function GET(req: NextRequest) {
	const projectId = new URL(req.url).searchParams.get('project_id')
	if (!projectId) return new Response('project_id required', { status: 400 })
	const inspections = await getInspections(projectId)
	return Response.json({ data: inspections })
}

export async function POST(req: NextRequest) {
	const body = await req.json()
	const result = await createInspectionRequest(body)
	return Response.json(result)
}

export async function PUT(req: NextRequest) {
	const body = await req.json()
	if (body.action === 'schedule') {
		const { id, scheduled_at, inspector_id } = body
		return Response.json(await scheduleInspection(id, scheduled_at, inspector_id))
	}
	if (body.action === 'signoff') {
		const { id, signature_data, role_at_signing, signed_by } = body
		return Response.json(await signOffInspection(id, signature_data, role_at_signing, signed_by))
	}
	return new Response('Invalid action', { status: 400 })
}
