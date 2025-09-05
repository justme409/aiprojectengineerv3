import { NextRequest } from 'next/server'
import { query } from '@/lib/db'

export async function GET(req: NextRequest) {
	const userId = new URL(req.url).searchParams.get('user_id')
	const projectId = new URL(req.url).searchParams.get('project_id')
	if (!userId) return new Response('user_id required', { status: 400 })
	if (!projectId) return new Response('project_id required', { status: 400 })
	// Derive subscription status via project_feature_flags presence; customize to Stripe if configured.
	const { rows } = await query('SELECT flags FROM public.project_feature_flags WHERE project_id=$1', [projectId])
	const hasQuality = !!rows[0]?.flags?.quality_module
	return Response.json({ active: hasQuality, flags: rows[0]?.flags || {} })
}


