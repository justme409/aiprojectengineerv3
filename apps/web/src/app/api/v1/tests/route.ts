import { NextRequest } from 'next/server'
import { createTestRequest, registerSample, importLabResults, evaluateConformance, getTestRequests, getTestResults, getSamples } from '@/lib/actions/test-actions'

export async function GET(req: NextRequest) {
	const projectId = new URL(req.url).searchParams.get('project_id')
	const type = new URL(req.url).searchParams.get('type') || 'test_requests'

	if (!projectId) return new Response('project_id required', { status: 400 })

	switch (type) {
		case 'test_requests':
			return Response.json({ data: await getTestRequests(projectId) })
		case 'test_results':
			return Response.json({ data: await getTestResults(projectId) })
		case 'samples':
			return Response.json({ data: await getSamples(projectId) })
		default:
			return new Response('Invalid type', { status: 400 })
	}
}

export async function POST(req: NextRequest) {
	const body = await req.json()
	const action = body.action

	if (action === 'create_test_request') {
		const result = await createTestRequest(body)
		return Response.json(result)
	}

	if (action === 'register_sample') {
		const result = await registerSample(body)
		return Response.json(result)
	}

	if (action === 'import_lab_results') {
		const result = await importLabResults(body)
		return Response.json(result)
	}

	if (action === 'evaluate_conformance') {
		const result = await evaluateConformance(body.test_result_id, body.acceptance_criteria)
		return Response.json(result)
	}

	return new Response('Invalid action', { status: 400 })
}

export async function PUT(req: NextRequest) {
	const body = await req.json()
	// Handle updates as needed
	return new Response('Not implemented', { status: 501 })
}
