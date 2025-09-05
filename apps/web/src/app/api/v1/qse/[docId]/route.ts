import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const UpdateQseDocumentSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  type: z.string().optional(),
  category: z.string().optional(),
  section: z.string().optional(),
  status: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { docId: string } }
) {
  try {
    const docId = params.docId

    // In a real implementation, this would query the database
    // For now, return mock data
    const mockDocument = {
      id: docId,
      title: 'IMS Manual',
      content: `# Integrated Management System Manual

This manual outlines the integrated management system for our organization.

## Scope

This IMS Manual applies to all organizational processes...

## Quality Management System

Our QMS is designed to ensure consistent quality...

## Environmental Management System

Our EMS focuses on environmental responsibility...

## Occupational Health & Safety

Our OH&S system prioritizes workplace safety...
      `,
      type: 'manual',
      category: 'tier_1',
      section: 'introduction',
      status: 'approved',
      organizationId: 'org-1',
      createdBy: 'user-1',
      approvedBy: 'user-2',
      approvedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        version: '1.0',
        reviewCycle: 'annual',
        lastReviewed: new Date().toISOString(),
      },
    }

    return NextResponse.json(mockDocument)
  } catch (error) {
    console.error('Error fetching QSE document:', error)
    return NextResponse.json(
      { error: 'Failed to fetch QSE document' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { docId: string } }
) {
  try {
    const docId = params.docId
    const body = await request.json()
    const validatedData = UpdateQseDocumentSchema.parse(body)

    // In a real implementation, this would update the database
    // For now, return mock response
    const updatedDocument = {
      id: docId,
      title: validatedData.title || 'IMS Manual',
      content: validatedData.content || 'Updated content...',
      type: validatedData.type || 'manual',
      category: validatedData.category || 'tier_1',
      section: validatedData.section || 'introduction',
      status: validatedData.status || 'draft',
      organizationId: 'org-1',
      createdBy: 'user-1',
      updatedAt: new Date().toISOString(),
      metadata: validatedData.metadata || {},
    }

    return NextResponse.json(updatedDocument)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating QSE document:', error)
    return NextResponse.json(
      { error: 'Failed to update QSE document' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { docId: string } }
) {
  try {
    const docId = params.docId

    // In a real implementation, this would delete from the database
    // For now, return success
    return NextResponse.json({
      message: 'QSE document deleted successfully',
      id: docId
    })
  } catch (error) {
    console.error('Error deleting QSE document:', error)
    return NextResponse.json(
      { error: 'Failed to delete QSE document' },
      { status: 500 }
    )
  }
}
