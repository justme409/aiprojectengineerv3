import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
	throw new Error('DATABASE_URL is required')
}

export const pool = new Pool({ connectionString })

export async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[] }> {
	const client = await pool.connect()
	try {
		const res = await client.query<T>(text, params)
		return { rows: res.rows }
	} finally {
		client.release()
	}
}
