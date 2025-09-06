import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ docId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { docId } = await params

    const result = await pool.query(`
      SELECT a.* FROM public.asset_heads a
      WHERE a.id = $1
    `, [docId])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const document = result.rows[0]

    // Check access to organization
    const accessCheck = await pool.query(`
      SELECT 1 FROM public.organization_users
      WHERE organization_id = $1 AND user_id = $2
    `, [document.organization_id, (session.user as any).id])

    if (accessCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({ document })
  } catch (error) {
    console.error('Error fetching QSE document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ docId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { docId } = await params
    const body = await request.json()
    const { content, status } = body

    // Check ownership
    const ownershipCheck = await pool.query(`
      SELECT a.organization_id FROM public.assets a
      WHERE a.id = $1
    `, [docId])

    if (ownershipCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const organizationId = ownershipCheck.rows[0].organization_id

    // Check access
    const accessCheck = await pool.query(`
      SELECT 1 FROM public.organization_users
      WHERE organization_id = $1 AND user_id = $2
    `, [organizationId, (session.user as any).id])

    if (accessCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const result = await pool.query(`
      UPDATE public.assets
      SET content = $1, status = $2, updated_at = now(), updated_by = $3
      WHERE id = $4
      RETURNING *
    `, [content, status, (session.user as any).id, docId])

    return NextResponse.json({ document: result.rows[0] })
  } catch (error) {
    console.error('Error updating QSE document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ docId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { docId } = await params

    // Check ownership
    const ownershipCheck = await pool.query(`
      SELECT a.organization_id FROM public.assets a
      WHERE a.id = $1
    `, [docId])

    if (ownershipCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const organizationId = ownershipCheck.rows[0].organization_id

    // Check access
    const accessCheck = await pool.query(`
      SELECT 1 FROM public.organization_users
      WHERE organization_id = $1 AND user_id = $2
    `, [organizationId, (session.user as any).id])

    if (accessCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    await pool.query(`
      UPDATE public.assets
      SET is_deleted = true, updated_at = now(), updated_by = $1
      WHERE id = $2
    `, [(session.user as any).id, docId])

    return NextResponse.json({ message: 'Document deleted' })
  } catch (error) {
    console.error('Error deleting QSE document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}