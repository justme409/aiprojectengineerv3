import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'
import { upsertAssetsAndEdges } from '@/lib/actions/graph-repo'
import { azureStorage } from '@/lib/azure/storage'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = await params
    const body = await request.json()
    const { files } = body

    if (!files || !Array.isArray(files)) {
      return NextResponse.json({ error: 'Files array required' }, { status: 400 })
    }

    // Create document assets for uploaded files
    const documentAssets = []

    for (const file of files) {
      const spec = {
        asset: {
          type: 'document',
          name: file.fileName,
          project_id: projectId,
          content: {
            storage_path: file.blobName,
            blob_url: azureStorage.isConfigured()
              ? azureStorage.getPublicUrl(file.blobName)
              : `https://${process.env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${process.env.AZURE_STORAGE_CONTAINER || 'documents'}/${file.blobName}`,
            file_name: file.fileName,
            content_type: file.contentType,
            size: file.size
          },
          status: 'draft'
        },
        edges: [],
        idempotency_key: `document:${file.fileName}:${projectId}`,
        audit_context: { action: 'upload_document', user_id: (session.user as any).id }
      }

      const result = await upsertAssetsAndEdges(spec, (session.user as any).id)
      documentAssets.push({ id: result.id, fileName: file.fileName })
    }

    // Trigger AI processing
    // This would normally start the LangGraph orchestrator
    // For now, just return success

    return NextResponse.json({
      message: 'Upload processing initiated',
      documents: documentAssets
    })
  } catch (error) {
    console.error('Error processing uploads:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}