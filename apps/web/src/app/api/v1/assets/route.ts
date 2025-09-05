import { NextRequest } from 'next/server'
import { query } from '@/lib/db'
import { upsertAssetsAndEdges } from '@/lib/actions/graph-repo'

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url)
	const type = searchParams.get('type')
	const projectId = searchParams.get('project_id')
	let sql = 'SELECT * FROM public.assets WHERE NOT is_deleted'
	const params: any[] = []
	if (type) { params.push(type); sql += ` AND type = $${params.length}` }
	if (projectId) { params.push(projectId); sql += ` AND project_id = $${params.length}` }
	sql += ' ORDER BY created_at DESC LIMIT 200'
	const { rows } = await query(sql, params)
	return Response.json({ data: rows })
}

export async function POST(req: NextRequest) {
	const body = await req.json()
	const result = await upsertAssetsAndEdges(body)
	return Response.json(result)
}

export async function PUT(req: NextRequest) {
	const body = await req.json()
	const result = await upsertAssetsAndEdges(body)
	return Response.json(result)
}
