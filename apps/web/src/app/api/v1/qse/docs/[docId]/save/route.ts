import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'

export async function POST(
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
    const body = await req.json()
    const content = body?.html ? { html: body.html } : { body: body?.body ?? '' }

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

    // Check if asset exists
    const existingAsset = await pool.query(`
      SELECT id FROM public.assets
      WHERE organization_id = $1 AND asset_type = 'qse_doc' AND name = $2
      LIMIT 1
    `, [organizationId, decodedDocId])

    if (existingAsset.rows.length === 0) {
      // Create new QSE asset
      const result = await pool.query(`
        INSERT INTO public.assets (
          id, asset_uid, version, type, name, organization_id, content, status, created_by, updated_by
        ) VALUES (
          gen_random_uuid(), gen_random_uuid(), 1, 'qse_doc', $1, $2, $3, 'draft', $4, $4
        ) RETURNING id
      `, [decodedDocId, organizationId, content, (session.user as any).id])

      return NextResponse.json({ id: result.rows[0].id })
    } else {
      // Update existing asset
      await pool.query(`
        UPDATE public.assets
        SET content = $1, updated_by = $2, updated_at = NOW()
        WHERE id = $3
      `, [content, (session.user as any).id, existingAsset.rows[0].id])

      return NextResponse.json({ id: existingAsset.rows[0].id })
    }
  } catch (error) {
    console.error('Error saving QSE document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
