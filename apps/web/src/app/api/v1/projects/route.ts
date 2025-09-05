import { NextRequest } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
	const { rows } = await query('SELECT * FROM public.projects ORDER BY created_at DESC')
	return Response.json({ data: rows })
}

export async function POST(req: NextRequest) {
	const body = await req.json()
	const id = body.id || crypto.randomUUID()
	const orgId = body.organization_id
	if (!orgId) return new Response('organization_id required', { status: 400 })
	await query(
		`INSERT INTO public.projects (id, name, description, location, client_name, created_by_user_id, status, organization_id, settings)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
		[id, body.name, body.description ?? null, body.location ?? null, body.client_name ?? null, body.created_by_user_id ?? null, body.status ?? 'draft', orgId, body.settings ?? {}]
	)
	return Response.json({ id })
}
