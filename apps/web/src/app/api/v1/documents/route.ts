import { NextRequest } from 'next/server'
import { getDocuments, generateAzureUploadUrlsAction } from '@/lib/actions/document-actions'

export async function GET(req: NextRequest) {
	const projectId = new URL(req.url).searchParams.get('project_id')
	if (!projectId) return new Response('project_id required', { status: 400 })
	const docs = await getDocuments(projectId)
	return Response.json({ data: docs })
}

export async function POST(req: NextRequest) {
	const body = await req.json()
	const projectId = body.project_id
	if (!projectId) return new Response('project_id required', { status: 400 })
	const uploads = await generateAzureUploadUrlsAction(projectId, body.files || [])
	return Response.json({ uploads })
}

export async function DELETE(req: NextRequest) {
	return new Response(null, { status: 204 })
}
