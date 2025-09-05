import { query } from '@/lib/db'
import { upsertAssetsAndEdges } from '@/lib/actions/graph-repo'

export async function upsertGeoFeature(input: {
	project_id: string
	name: string
	feature_type: 'point' | 'polygon' | 'line'
	coordinates: any
	properties?: any
	associated_asset_id?: string
}) {
	const spec = {
		asset: {
			type: 'geo_feature',
			name: input.name,
			project_id: input.project_id,
			content: input
		},
		edges: input.associated_asset_id ? [{
			from_asset_id: '',
			to_asset_id: input.associated_asset_id,
			edge_type: 'RELATED_TO'
		}] : [],
		idempotency_key: `geo_feature:${input.project_id}:${input.name}`
	}
	return upsertAssetsAndEdges(spec)
}

export async function pinAssetToMap(assetId: string, coordinates: [number, number], properties?: any) {
	// Create or update a geo feature for the asset
	const asset = await query('SELECT * FROM public.assets WHERE id=$1', [assetId])
	if (asset.rows.length === 0) throw new Error('Asset not found')

	const featureName = `Pin for ${asset.rows[0].name}`

	return upsertGeoFeature({
		project_id: asset.rows[0].project_id,
		name: featureName,
		feature_type: 'point',
		coordinates: {
			type: 'Point',
			coordinates: coordinates
		},
		properties: {
			asset_id: assetId,
			asset_type: asset.rows[0].type,
			...properties
		},
		associated_asset_id: assetId
	})
}

export async function getGeoFeatures(projectId: string, bounds?: any) {
	let queryText = `
		SELECT a.*, ST_AsGeoJSON(a.content->'coordinates') as geometry
		FROM public.assets a
		WHERE a.project_id = $1
		AND a.type = 'geo_feature'
		AND a.is_current AND NOT a.is_deleted
	`
	const params = [projectId]

	if (bounds) {
		// Add bounding box filter if provided
		queryText += ` AND ST_Intersects(
			ST_GeomFromGeoJSON(a.content->>'coordinates'),
			ST_MakeEnvelope($2, $3, $4, $5, 4326)
		)`
		params.push(bounds.west, bounds.south, bounds.east, bounds.north)
	}

	queryText += ' ORDER BY a.created_at DESC'

	const { rows } = await query(queryText, params)

	// Format as GeoJSON FeatureCollection
	const features = rows.map(row => ({
		type: 'Feature',
		geometry: JSON.parse(row.geometry),
		properties: {
			id: row.id,
			name: row.name,
			feature_type: row.content?.feature_type,
			associated_asset_id: row.content?.associated_asset_id,
			...row.content?.properties
		}
	}))

	return {
		type: 'FeatureCollection',
		features
	}
}

export async function getAssetLocations(projectId: string) {
	// Get all assets with location information (from edges to LBS nodes or geo features)
	const { rows } = await query(`
		SELECT
			a.id,
			a.name,
			a.type,
			a.content,
			gf.content->'coordinates' as coordinates,
			lbs.path_key as lbs_path,
			lbs.content->'coordinates' as lbs_coordinates
		FROM public.assets a
		LEFT JOIN public.asset_edges e ON e.from_asset_id = a.id AND e.edge_type = 'RELATED_TO'
		LEFT JOIN public.assets gf ON gf.id = e.to_asset_id AND gf.type = 'geo_feature'
		LEFT JOIN public.asset_edges e2 ON e2.from_asset_id = a.id AND e2.edge_type = 'LOCATED_IN_LBS'
		LEFT JOIN public.assets lbs ON lbs.id = e2.to_asset_id AND lbs.type = 'lbs_node'
		WHERE a.project_id = $1
		AND a.is_current AND NOT a.is_deleted
		AND (gf.id IS NOT NULL OR lbs.id IS NOT NULL)
		ORDER BY a.created_at DESC
	`, [projectId])

	return rows.map(row => ({
		asset_id: row.id,
		name: row.name,
		type: row.type,
		coordinates: row.coordinates || row.lbs_coordinates,
		lbs_path: row.lbs_path,
		properties: row.content
	}))
}

export async function updateGeoFeature(featureId: string, updates: Partial<{
	name: string
	coordinates: any
	properties: any
}>) {
	const spec = {
		asset: {
			id: featureId,
			name: updates.name,
			content: {
				coordinates: updates.coordinates,
				properties: updates.properties
			}
		},
		idempotency_key: `update_geo:${featureId}`
	}
	return upsertAssetsAndEdges(spec)
}

export async function deleteGeoFeature(featureId: string) {
	await query('UPDATE public.assets SET is_deleted=true WHERE id=$1', [featureId])
	return { id: featureId }
}
