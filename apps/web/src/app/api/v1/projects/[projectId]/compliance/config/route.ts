import { NextRequest } from 'next/server'
import { query } from '@/lib/db'
import { upsertAssetsAndEdges } from '@/lib/actions/graph-repo'

export async function GET(req: NextRequest, { params }: { params: { projectId: string } }) {
	const projectId = params.projectId
	const { rows } = await query('SELECT * FROM public.project_feature_flags WHERE project_id=$1', [projectId])
	return Response.json({ config: rows[0] || null })
}

export async function POST(req: NextRequest, { params }: { params: { projectId: string } }) {
	const body = await req.json()
	const projectId = params.projectId
	const { jurisdiction, pack_asset_uid } = body

	if (pack_asset_uid) {
		// Bind pack and cache flags
		const pack = await query('SELECT * FROM public.assets WHERE id=$1 AND type=$2', [pack_asset_uid, 'compliance_pack'])
		if (pack.rows.length === 0) return new Response('Pack not found', { status: 404 })

		const flags = pack.rows[0].content?.feature_flags_default || {}
		await query(
			`INSERT INTO public.project_feature_flags (project_id, pack_asset_uid, flags) VALUES ($1,$2,$3)
			 ON CONFLICT (project_id) DO UPDATE SET pack_asset_uid=$2, flags=$3`,
			[projectId, pack_asset_uid, JSON.stringify(flags)]
		)

		// Create/update project compliance config asset
		const configSpec = {
			asset: {
				type: 'project_compliance_config',
				name: `Compliance Config for ${projectId}`,
				project_id: projectId,
				content: { jurisdiction, pack_asset_uid, flags }
			},
			edges: [{
				from_asset_id: '', // Will be set by upsert
				to_asset_id: pack_asset_uid,
				edge_type: 'IMPLEMENTS',
				properties: { jurisdiction }
			}],
			idempotency_key: `compliance_config:${projectId}`
		}
		await upsertAssetsAndEdges(configSpec)
	}

	return Response.json({ success: true })
}
