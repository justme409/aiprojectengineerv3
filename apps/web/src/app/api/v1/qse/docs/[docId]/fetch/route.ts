import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ docId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { docId } = await params
    const decodedDocId = decodeURIComponent(docId)

    // Get organization ID from user's organizations
    const orgResult = await pool.query(`
      SELECT organization_id FROM public.organization_users
      WHERE user_id = $1
      LIMIT 1
    `, [(session.user as any).id])

    if (orgResult.rows.length === 0) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    const organizationId = orgResult.rows[0].organization_id

    // Find the QSE asset by document number
    const assetResult = await pool.query(`
      SELECT id, content FROM public.assets
      WHERE organization_id = $1 AND asset_type = 'qse_doc' AND name = $2
      LIMIT 1
    `, [organizationId, decodedDocId])

    if (assetResult.rows.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const asset = assetResult.rows[0]

    return NextResponse.json(asset)
  } catch (error) {
    console.error('Error fetching QSE document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
