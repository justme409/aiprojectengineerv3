import { NextRequest } from 'next/server'
import { logPlantPrestart, recordMaintenance, logUtilization, getFieldAssets } from '@/lib/actions/field-actions'

export async function GET(req: NextRequest) {
	const projectId = new URL(req.url).searchParams.get('project_id')
	const type = new URL(req.url).searchParams.get('type') || 'plant_prestart'

	if (!projectId) return new Response('project_id required', { status: 400 })

	const assets = await getFieldAssets(projectId, type)
	return Response.json({ data: assets })
}

export async function POST(req: NextRequest) {
	const body = await req.json()
	const action = body.action

	if (action === 'log_prestart') {
		const result = await logPlantPrestart(body)
		return Response.json(result)
	}

	if (action === 'record_maintenance') {
		const result = await recordMaintenance(body)
		return Response.json(result)
	}

	if (action === 'log_utilization') {
		const result = await logUtilization(body)
		return Response.json(result)
	}

	return new Response('Invalid action', { status: 400 })
}
