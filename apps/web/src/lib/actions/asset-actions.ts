'use server'

import { query } from '@/lib/db'
import { IdempotentAssetWriteSpec } from '@/types/graph'
import { upsertAssetsAndEdges } from '@/lib/actions/graph-repo'
import { createThread, startThreadRun } from '@/lib/actions/langgraph-server-actions'

export async function createAsset(spec: IdempotentAssetWriteSpec) {
	return upsertAssetsAndEdges(spec)
}

export async function updateAsset(spec: IdempotentAssetWriteSpec) {
	return upsertAssetsAndEdges(spec)
}

export async function getAssets(filter: { project_id?: string, type?: string, limit?: number }) {
	let sql = 'SELECT * FROM public.assets WHERE NOT is_deleted'
	const params: any[] = []
	if (filter.project_id) { params.push(filter.project_id); sql += ` AND project_id=$${params.length}` }
	if (filter.type) { params.push(filter.type); sql += ` AND type=$${params.length}` }
	sql += ' ORDER BY created_at DESC'
	if (filter.limit) { params.push(filter.limit); sql += ` LIMIT $${params.length}` }
	const { rows } = await query(sql, params)
	return rows
}

export async function getAssetById(id: string) {
	const { rows } = await query('SELECT * FROM public.assets WHERE id=$1 AND NOT is_deleted', [id])
	return rows[0] || null
}

export async function deleteAsset(id: string) {
	await query('UPDATE public.assets SET is_deleted=true WHERE id=$1', [id])
	return { id }
}

export async function saveAssetContent(assetId: string, projectId: string, content: any) {
  await query('UPDATE public.assets SET content = $2, updated_at = NOW() WHERE id = $1', [assetId, content])
  return { success: true }
}

export async function commitAssetRevision(params: { assetId: string, projectId: string, commitMessage?: string | null, isApproval?: boolean }) {
  // Create a new immutable version row by inserting a superseding asset version and marking current as not current
  // Simplified: use Postgres function if available; otherwise emulate minimal behavior
  const { rows } = await query(
    `WITH current AS (
       SELECT id, asset_uid, version FROM public.assets WHERE id = $1 AND NOT is_deleted
     ), ins AS (
       INSERT INTO public.assets (
         id, asset_uid, version, is_current, supersedes_asset_id, type, subtype, name, organization_id, project_id,
         document_number, revision_code, path_key, status, approval_state, classification, idempotency_key, metadata, content
       )
       SELECT gen_random_uuid(), c.asset_uid, c.version + 1, true, c.id, a.type, a.subtype, a.name, a.organization_id, a.project_id,
              a.document_number, a.revision_code, a.path_key, a.status, a.approval_state, a.classification, a.idempotency_key, a.metadata,
              jsonb_set(a.content, '{revision}', to_jsonb((c.version + 1)::text), true)
       FROM public.assets a JOIN current c ON a.id = c.id
       RETURNING id
     )
     UPDATE public.assets SET is_current=false, updated_at = NOW() WHERE id = (SELECT id FROM current)
     RETURNING (SELECT id FROM ins) AS new_id`,
    [params.assetId]
  )
  return { success: true, data: { new_asset_id: rows?.[0]?.new_id } }
}
