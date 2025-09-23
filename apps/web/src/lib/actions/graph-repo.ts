// NOTE: Deprecated for new write flows. Prefer LangGraph service writes for
// asset creation/update where possible, to centralize validation and edge semantics.
// Existing API routes still use this until migrated.
import { pool } from '@/lib/db'
import { EdgeSpec, IdempotentAssetWriteSpec, RelationshipEdgeType } from '@/types/graph'

const classificationDefaults: Record<string, 'public'|'internal'|'confidential'|'restricted'> = {
	email: 'restricted',
	correspondence: 'restricted',
	timesheet: 'restricted',
	incident: 'restricted',
	daily_diary: 'confidential',
	site_instruction: 'confidential',
	itp_document: 'confidential',
	itp_template: 'confidential',
	test_result: 'confidential',
	plan: 'internal',
	document: 'internal',
}

function applyClassificationDefaults(asset: any) {
	if (!asset.classification) {
		const def = classificationDefaults[asset.type]
		if (def) asset.classification = def
	}
}

const allowedFromTo: Array<{ edge_type: RelationshipEdgeType, from: string[], to: string[], required_properties?: string[] }> = [
	{ edge_type: 'PARENT_OF', from: ['wbs_node','lbs_node','document','itp_document','plan'], to: ['wbs_node','lbs_node','document','inspection_point','plan'] },
	{ edge_type: 'BELONGS_TO_PROJECT', from: ['*'], to: ['project'] },
	{ edge_type: 'MAPPED_TO', from: ['wbs_node'], to: ['lbs_node'], required_properties: ['strength','rationale'] },
	{ edge_type: 'IMPLEMENTS', from: ['procedure','control','inspection_request','project_compliance_config'], to: ['requirement','itp_document','compliance_pack'] },
	{ edge_type: 'EVIDENCES', from: ['record','photo','measurement','test_result','inspection_request','batch_ticket','calibration_certificate','sample','test_request'], to: ['requirement','itp_document','lot','incident'], required_properties: ['source','timestamp'] },
	{ edge_type: 'APPROVED_BY', from: ['document','itp_template','policy','procedure','inspection_signature','approval_workflow','inspection_point'], to: ['user','role'], required_properties: ['approved_at'] },
	{ edge_type: 'REVIEWED_BY', from: ['document','itp_template','policy','procedure','inspection_request','inspection_point'], to: ['user','role'], required_properties: ['reviewed_at'] },
	{ edge_type: 'CONTEXT_FOR', from: ['*'], to: ['processing_run'] },
	{ edge_type: 'INPUT_TO', from: ['*'], to: ['processing_run'] },
	{ edge_type: 'OUTPUT_OF', from: ['*'], to: ['processing_run'] },
	{ edge_type: 'GENERATED_FROM', from: ['*'], to: ['*'] },
	{ edge_type: 'LOCATED_IN_LBS', from: ['inspection_request','test_request','sample','daily_diary','site_instruction','plant_prestart','maintenance_record','incident','geo_feature'], to: ['lbs_node'] },
	{ edge_type: 'COVERS_WBS', from: ['inspection_request','test_request'], to: ['wbs_node'] },
	{ edge_type: 'BLOCKED_BY', from: ['lot','itp_document'], to: ['inspection_point','control','procedure','policy'], required_properties: ['reason'] },
	{ edge_type: 'CLOSES', from: ['capa'], to: ['incident'], required_properties: ['closed_at'] },
	{ edge_type: 'RESOLVED_BY', from: ['incident'], to: ['user'], required_properties: ['resolved_at'] },
	{ edge_type: 'REFERENCES', from: ['correspondence','rfi','inspection_point','document'], to: ['drawing','spec','itp_document','document','itp_template'], required_properties: ['reference_type'] },
]

function isTypeAllowed(list: string[], type: string): boolean {
	return list.includes('*') || list.includes(type)
}

function enforceAllowedFromTo(edge: EdgeSpec, fromType: string, toType: string) {
	const rule = allowedFromTo.find(r => r.edge_type === edge.edge_type)
	if (!rule) return
	if (!isTypeAllowed(rule.from, fromType) || !isTypeAllowed(rule.to, toType)) {
		throw new Error(`Edge ${edge.edge_type} not allowed from ${fromType} to ${toType}`)
	}
	if (rule.required_properties) {
		for (const prop of rule.required_properties) {
			if (!edge.properties || edge.properties[prop] === undefined) {
				throw new Error(`Edge ${edge.edge_type} missing required property ${prop}`)
			}
		}
	}
}

export async function upsertAssetsAndEdges(spec: IdempotentAssetWriteSpec, actorUserId?: string) {
	const client = await pool.connect()
	try {
		await client.query('BEGIN')
		const asset = { ...spec.asset }
		applyClassificationDefaults(asset)

		if (!asset.id) asset.id = asset.id || (await client.query<{ id: string }>(`SELECT gen_random_uuid() AS id`)).rows[0].id
		if (!asset.asset_uid) asset.asset_uid = asset.asset_uid || asset.id
		if (!asset.version) asset.version = asset.version || 1
		if (asset.is_current === undefined) asset.is_current = true

		if (!asset.organization_id && asset.project_id) {
			const org = await client.query<{ organization_id: string }>('SELECT organization_id FROM public.projects WHERE id=$1', [asset.project_id])
			asset.organization_id = org.rows[0]?.organization_id
		}

		if (!spec.idempotency_key) throw new Error('idempotency_key required')

		// Idempotent upsert by (project_id, type, idempotency_key)
		const existing = await client.query('SELECT id FROM public.assets WHERE project_id IS NOT DISTINCT FROM $1 AND type=$2 AND idempotency_key=$3 ORDER BY created_at DESC LIMIT 1', [asset.project_id ?? null, asset.type, spec.idempotency_key])
		if (existing.rows.length > 0) {
			// do nothing for asset body; but we can still validate edges
			asset.id = existing.rows[0].id
		} else {
			await client.query(
				`INSERT INTO public.assets (id, asset_uid, version, is_current, type, name, organization_id, project_id, parent_asset_id, document_number, revision_code, path_key, status, approval_state, classification, idempotency_key, metadata, content)
				 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
				[
					asset.id, asset.asset_uid, asset.version, asset.is_current, asset.type, asset.name, asset.organization_id, asset.project_id,
					asset.parent_asset_id ?? null, asset.document_number ?? null, asset.revision_code ?? null, asset.path_key ?? null,
					asset.status ?? 'draft', asset.approval_state ?? 'not_required', asset.classification, spec.idempotency_key,
					asset.metadata ?? {}, asset.content ?? {}
				]
			)
		}

		if (spec.edges && spec.edges.length > 0) {
			for (const e of spec.edges) {
				const fromTypeRes = await client.query<{ type: string }>('SELECT type FROM public.assets WHERE id=$1', [e.from_asset_id])
				const toTypeRes = await client.query<{ type: string }>('SELECT type FROM public.assets WHERE id=$1', [e.to_asset_id])
				if (fromTypeRes.rows.length === 0 || toTypeRes.rows.length === 0) throw new Error('Edge endpoints must exist')
				enforceAllowedFromTo(e, fromTypeRes.rows[0].type, toTypeRes.rows[0].type)
				if (e.idempotency_key) {
					await client.query(
						`INSERT INTO public.asset_edges (id, from_asset_id, to_asset_id, edge_type, properties, idempotency_key)
						 VALUES (gen_random_uuid(), $1,$2,$3,$4,$5)
						 ON CONFLICT (edge_type, idempotency_key) WHERE idempotency_key IS NOT NULL DO NOTHING`,
						[e.from_asset_id, e.to_asset_id, e.edge_type, e.properties ?? {}, e.idempotency_key]
					)
				} else {
					await client.query(
						`INSERT INTO public.asset_edges (id, from_asset_id, to_asset_id, edge_type, properties)
						 VALUES (gen_random_uuid(), $1,$2,$3,$4)`,
						[e.from_asset_id, e.to_asset_id, e.edge_type, e.properties ?? {}]
					)
				}
			}
		}

		await client.query('INSERT INTO public.audit_events (id, project_id, actor_user_id, action, resource_type, resource_id, details) VALUES (gen_random_uuid(), $1,$2,$3,$4,$5,$6)', [asset.project_id ?? null, actorUserId ?? null, 'upsertAssetsAndEdges', 'asset', asset.id, spec.audit_context ?? {}])
		await client.query('COMMIT')
		return { id: asset.id }
	} catch (e) {
		try { await client.query('ROLLBACK') } catch {}
		throw e
	} finally {
		try { client.release() } catch {}
	}
}

export async function validateAndWriteEdges(edges: EdgeSpec[]) {
	for (const e of edges) {
		// validation occurs in upsert, this helper is placeholder for future
	}
}

export { applyClassificationDefaults }
