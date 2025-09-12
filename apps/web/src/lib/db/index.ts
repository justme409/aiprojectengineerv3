import { Pool, QueryResultRow } from 'pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
	throw new Error('DATABASE_URL is required')
}

export const pool = new Pool({
	connectionString,
	idleTimeoutMillis: 30000,
	max: 10,
})

export async function query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<{ rows: T[] }> {
	const client = await pool.connect()
	try {
		const res = await client.query<T>(text, params)
		return { rows: res.rows }
	} finally {
		client.release()
	}
}
