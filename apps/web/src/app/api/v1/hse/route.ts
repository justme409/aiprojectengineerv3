import { NextRequest } from 'next/server'
import { createSwms, getHSEAssets, issuePermit, logToolboxTalk, recordIncident } from '@/lib/actions/hse-actions'

export async function GET(req: NextRequest) {
	const projectId = new URL(req.url).searchParams.get('project_id')
	const type = new URL(req.url).searchParams.get('type') || 'swms'
	if (!projectId) return new Response('project_id required', { status: 400 })
	const assets = await getHSEAssets(projectId, type)
	return Response.json({ data: assets })
}

export async function POST(req: NextRequest) {
	const body = await req.json()
	const action = body.action

	if (action === 'create_swms') {
		const result = await createSwms(body)
		return Response.json(result)
	}

	if (action === 'issue_permit') {
		const result = await issuePermit(body)
		return Response.json(result)
	}

	if (action === 'log_toolbox_talk') {
		const result = await logToolboxTalk(body)
		return Response.json(result)
	}

	if (action === 'record_incident') {
		const result = await recordIncident(body)
		return Response.json(result)
	}

	return new Response('Invalid action', { status: 400 })
}

export async function PUT(req: NextRequest) {
	const body = await req.json()
	// Handle updates as needed
	return new Response('Not implemented', { status: 501 })
}
