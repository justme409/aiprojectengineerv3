import { NextRequest } from 'next/server'
import { createMaterialApproval, getMaterials, approveMaterial, attachBatchTicket } from '@/lib/actions/material-actions'

export async function GET(req: NextRequest) {
	const projectId = new URL(req.url).searchParams.get('project_id')
	if (!projectId) return new Response('project_id required', { status: 400 })
	const materials = await getMaterials(projectId)
	return Response.json({ data: materials })
}

export async function POST(req: NextRequest) {
	const body = await req.json()
	const result = await createMaterialApproval(body)
	return Response.json(result)
}

export async function PUT(req: NextRequest) {
	const body = await req.json()
	if (body.action === 'approve') {
		const { id, approved_by, approval_date } = body
		return Response.json(await approveMaterial(id, approved_by, approval_date))
	}
	if (body.action === 'attach_batch_ticket') {
		const { material_id, batch_ticket_data } = body
		return Response.json(await attachBatchTicket(material_id, batch_ticket_data))
	}
	return new Response('Invalid action', { status: 400 })
}
