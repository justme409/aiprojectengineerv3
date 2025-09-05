import { query } from '@/lib/db'
import { IdempotentAssetWriteSpec } from '@/types/graph'
import { upsertAssetsAndEdges } from '@/lib/actions/graph-repo'

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

export async function deleteAsset(id: string) {
	await query('UPDATE public.assets SET is_deleted=true WHERE id=$1', [id])
	return { id }
}
