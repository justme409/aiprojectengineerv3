import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!projectId) {
      return NextResponse.json({ error: 'projectId required' }, { status: 400 })
    }

    // Check access
    const accessCheck = await pool.query(`
      SELECT 1 FROM public.projects p
      JOIN public.organization_users ou ON ou.organization_id = p.organization_id
      WHERE p.id = $1 AND ou.user_id = $2
    `, [projectId, (session.user as any).id])

    if (accessCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const result = await pool.query(`
      SELECT d.*, a.name as asset_name, a.type as asset_type
      FROM public.documents d
      LEFT JOIN public.assets a ON a.id = d.asset_id
      WHERE d.project_id = $1
      ORDER BY d.created_at DESC
      LIMIT $2 OFFSET $3
    `, [projectId, limit, offset])

    return NextResponse.json({ documents: result.rows })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, fileName, contentType, size, blobUrl, storagePath } = body

    if (!projectId || !fileName) {
      return NextResponse.json({ error: 'projectId and fileName required' }, { status: 400 })
    }

    // Check access
    const accessCheck = await pool.query(`
      SELECT 1 FROM public.projects p
      JOIN public.organization_users ou ON ou.organization_id = p.organization_id
      WHERE p.id = $1 AND ou.user_id = $2
    `, [projectId, (session.user as any).id])

    if (accessCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const result = await pool.query(`
      INSERT INTO public.documents (
        id, project_id, blob_url, storage_path, file_name,
        content_type, size, uploaded_by
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7
      ) RETURNING *
    `, [projectId, blobUrl, storagePath, fileName, contentType, size, (session.user as any).id])

    return NextResponse.json({ document: result.rows[0] })
  } catch (error) {
    console.error('Error creating document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('id')

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 })
    }

    // Check ownership and delete
    const result = await pool.query(`
      DELETE FROM public.documents
      WHERE id = $1 AND uploaded_by = $2
      RETURNING *
    `, [documentId, (session.user as any).id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Document not found or access denied' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Document deleted' })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}