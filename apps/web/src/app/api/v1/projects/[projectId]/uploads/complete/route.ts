import { NextRequest } from 'next/server'
import { notifyAzureUploadsCompleteAction } from '@/lib/actions/document-actions'

export async function POST(req: NextRequest, { params }: { params: { projectId: string } }) {
	const body = await req.json()
	const documentIds: string[] = body.document_ids || []
	const res = await notifyAzureUploadsCompleteAction(params.projectId, documentIds)
	return Response.json(res)
}
