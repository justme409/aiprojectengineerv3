import { NextRequest } from 'next/server'
import { query } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: { projectId: string } }) {
	const { rows } = await query("SELECT * FROM public.assets WHERE project_id=$1 AND type IN ('plan','wbs_node','lbs_node') AND is_current AND NOT is_deleted ORDER BY created_at DESC", [params.projectId])
	return Response.json({ data: rows })
}

export async function POST(req: NextRequest, { params }: { params: { projectId: string } }) {
	return new Response('Not Implemented', { status: 501 })
}
