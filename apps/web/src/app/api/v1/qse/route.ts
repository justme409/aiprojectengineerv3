import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const CreateQseDocumentSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  type: z.string(),
  category: z.string(),
  section: z.string().optional(),
  organizationId: z.string(),
  createdBy: z.string(),
  metadata: z.record(z.any()).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')

    // In a real implementation, this would query the database
    // For now, return mock data
    const mockDocuments = [
      {
        id: '1',
        title: 'IMS Manual',
        content: 'Integrated Management System Manual content...',
        type: 'manual',
        category: 'tier_1',
        section: 'introduction',
        status: 'approved',
        organizationId: 'org-1',
        createdBy: 'user-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {},
      },
      {
        id: '2',
        title: 'Quality Policy',
        content: 'Quality Policy document content...',
        type: 'policy',
        category: 'tier_1',
        section: 'policies',
        status: 'approved',
        organizationId: 'org-1',
        createdBy: 'user-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {},
      },
    ]

    return NextResponse.json({
      documents: mockDocuments,
      total: mockDocuments.length,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
    })
  } catch (error) {
    console.error('Error fetching QSE documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch QSE documents' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CreateQseDocumentSchema.parse(body)

    // In a real implementation, this would save to the database
    // For now, return mock response
    const newDocument = {
      id: `qse-${Date.now()}`,
      ...validatedData,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(newDocument, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating QSE document:', error)
    return NextResponse.json(
      { error: 'Failed to create QSE document' },
      { status: 500 }
    )
  }
}
