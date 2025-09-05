import { NextRequest } from 'next/server'
import { ingestRawEmail, getCorrespondenceThreads, getThreadMessages, linkEmailToAssets } from '@/lib/actions/email-ingest-actions'

export async function POST(req: NextRequest) {
	const body = await req.json()
	const action = body.action || 'ingest'

	if (action === 'ingest') {
		if (!body.raw_mime || !body.project_id) {
			return new Response('raw_mime and project_id required', { status: 400 })
		}

		const result = await ingestRawEmail(body.raw_mime, body.project_id)
		return Response.json(result)
	}

	if (action === 'get_threads') {
		const threads = await getCorrespondenceThreads(body.project_id)
		return Response.json({ threads })
	}

	if (action === 'get_thread_messages') {
		const messages = await getThreadMessages(body.thread_key, body.project_id)
		return Response.json({ messages })
	}

	if (action === 'link_to_assets') {
		const result = await linkEmailToAssets(body.email_asset_id, body.referenced_asset_ids)
		return Response.json(result)
	}

	return new Response('Invalid action', { status: 400 })
}

export async function GET(req: NextRequest) {
	const projectId = new URL(req.url).searchParams.get('project_id')
	const threadKey = new URL(req.url).searchParams.get('thread_key')

	if (threadKey && projectId) {
		const messages = await getThreadMessages(threadKey, projectId)
		return Response.json({ messages })
	}

	if (projectId) {
		const threads = await getCorrespondenceThreads(projectId)
		return Response.json({ threads })
	}

	return new Response('project_id required', { status: 400 })
}
