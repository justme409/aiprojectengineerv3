import { query } from '@/lib/db'
import { generateBlobSasUrl } from '@/lib/azure/blob'

export async function generateAzureUploadUrlsAction(projectId: string, files: Array<{ file_name: string, content_type?: string, size?: number, source_hash?: string }>) {
	const out: any[] = []
	for (const f of files) {
		const id = crypto.randomUUID()
		const storagePath = `${projectId}/${id}/${encodeURIComponent(f.file_name)}`
		await query(
			`INSERT INTO public.documents (id, project_id, storage_path, file_name, content_type, size, source_hash) VALUES ($1,$2,$3,$4,$5,$6,$7)
			 ON CONFLICT (project_id, source_hash) WHERE $7 IS NOT NULL DO NOTHING`,
			[id, projectId, storagePath, f.file_name, f.content_type ?? null, f.size ?? null, f.source_hash ?? null]
		)
		const uploadUrl = generateBlobSasUrl(storagePath)
		out.push({ id, uploadUrl, storagePath })
	}
	return out
}

export async function notifyAzureUploadsCompleteAction(projectId: string, documentIds: string[]) {
	await query(`UPDATE public.documents SET processing_status='uploaded' WHERE project_id=$1 AND id = ANY($2::uuid[])`, [projectId, documentIds])
	return { ok: true }
}

export async function getDocuments(projectId: string) {
	const { rows } = await query('SELECT * FROM public.documents WHERE project_id=$1 ORDER BY created_at DESC', [projectId])
	return rows
}
