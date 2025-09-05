import { query } from '@/lib/db'

export async function GET() {
	// Return last 20 webhook events from events table if present
	try {
		const { rows } = await query('SELECT * FROM public.events WHERE source_table=$1 ORDER BY occurred_at DESC LIMIT 20', ['webhook'])
		return Response.json({ events: rows })
	} catch {
		return Response.json({ events: [] })
	}
}


