import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'

export async function GET() {
  try {
    const session = await auth()
    console.log('Session:', session)
    console.log('Session user:', session?.user)
    console.log('Session user id:', (session?.user as any)?.id)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    console.log('Using user ID:', userId)

    const result = await pool.query(`
      SELECT p.*, o.name as organization_name
      FROM public.projects p
      JOIN public.organizations o ON o.id = p.organization_id
      JOIN public.organization_users ou ON ou.organization_id = p.organization_id AND ou.user_id = $1
      ORDER BY p.created_at DESC
    `, [userId])

    console.log('Query result count:', result.rows.length)
    console.log('Projects found:', result.rows.map(p => ({ id: p.id, name: p.name })))

    return NextResponse.json({ projects: result.rows })
  } catch (error) {
    console.error('Error fetching projects:', error)
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
    const { name, description, location, client_name } = body

    // Get user's organization
    const orgResult = await pool.query(`
      SELECT organization_id FROM public.organization_users
      WHERE user_id = $1 LIMIT 1
    `, [(session.user as any).id])

    if (orgResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not associated with organization' }, { status: 400 })
    }

    const organizationId = orgResult.rows[0].organization_id

    // Create project
    const projectResult = await pool.query(`
      INSERT INTO public.projects (id, name, description, location, client_name, created_by_user_id, organization_id)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [name, description, location, client_name, (session.user as any).id, organizationId])

    return NextResponse.json({ project: projectResult.rows[0] })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}