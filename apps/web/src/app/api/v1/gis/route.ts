import { NextRequest } from 'next/server'
import { upsertGeoFeature, pinAssetToMap, getGeoFeatures, getAssetLocations, updateGeoFeature, deleteGeoFeature } from '@/lib/actions/map-actions'

export async function GET(req: NextRequest) {
	const projectId = new URL(req.url).searchParams.get('project_id')
	const action = new URL(req.url).searchParams.get('action') || 'features'

	if (!projectId) return new Response('project_id required', { status: 400 })

	if (action === 'asset_locations') {
		const locations = await getAssetLocations(projectId)
		return Response.json({ data: locations })
	}

	// Default: get geo features
	const bounds = req.nextUrl.searchParams.get('bounds')
	let parsedBounds
	if (bounds) {
		try {
			parsedBounds = JSON.parse(bounds)
		} catch (e) {
			// Ignore invalid bounds
		}
	}

	const features = await getGeoFeatures(projectId, parsedBounds)
	return Response.json(features)
}

export async function POST(req: NextRequest) {
	const body = await req.json()
	const action = body.action

	if (action === 'upsert_feature') {
		const result = await upsertGeoFeature(body)
		return Response.json(result)
	}

	if (action === 'pin_asset') {
		const result = await pinAssetToMap(body.asset_id, body.coordinates, body.properties)
		return Response.json(result)
	}

	return new Response('Invalid action', { status: 400 })
}

export async function PUT(req: NextRequest) {
	const body = await req.json()
	if (body.id) {
		const result = await updateGeoFeature(body.id, body.updates)
		return Response.json(result)
	}
	return new Response('Invalid request', { status: 400 })
}

export async function DELETE(req: NextRequest) {
	const featureId = new URL(req.url).searchParams.get('id')
	if (!featureId) return new Response('id required', { status: 400 })

	await deleteGeoFeature(featureId)
	return Response.json({ success: true })
}
