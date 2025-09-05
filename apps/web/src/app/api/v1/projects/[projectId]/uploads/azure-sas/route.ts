import { NextRequest } from 'next/server'
import { query } from '@/lib/db'
import { generateBlobSasUrl } from '@/lib/azure/blob'
import crypto from 'node:crypto'

export async function POST(req: NextRequest, { params }: { params: { projectId: string } }) {
	const body = await req.json()
	const projectId = params.projectId
	const files: Array<{ file_name: string, content_type?: string, size?: number, source_hash?: string }> = body.files || []
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
	return Response.json({ uploads: out })
}
