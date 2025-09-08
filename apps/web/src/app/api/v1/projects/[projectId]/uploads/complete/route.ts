import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'
import { upsertAssetsAndEdges } from '@/lib/actions/graph-repo'
import { azureStorage } from '@/lib/azure/storage'
import { triggerProjectProcessingViaLangGraphEnhanced } from '@/lib/actions/langgraph-actions'

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
    // Support both shapes: { files: [{ fileName, blobName, contentType, size }] } or
    // legacy { document_ids } which we ignore here for asset creation
    const { files } = body

    if (!files || !Array.isArray(files)) {
      return NextResponse.json({ error: 'Files array required' }, { status: 400 })
    }

    // Create document assets for uploaded files
    const documentAssets: Array<{ id: string, fileName: string }> = []

    for (const file of files) {
      const fileName = file.fileName ?? file.filename
      const blobName = file.blobName ?? file.storage_path ?? `projects/${projectId}/${fileName}`
      const contentType = file.contentType ?? file.type ?? 'application/octet-stream'
      const size = file.size
      const spec = {
        asset: {
          type: 'document',
          name: fileName,
          project_id: projectId,
          content: {
            storage_path: blobName,
            blob_url: azureStorage.isConfigured()
              ? azureStorage.getPublicUrl(blobName)
              : `https://${process.env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${process.env.AZURE_STORAGE_CONTAINER || 'documents'}/${blobName}`,
            file_name: fileName,
            content_type: contentType,
            size: size,
            // Reserve fields for agent outputs under asset.content
            raw_content: null,
            document_metadata: null
          },
          status: 'draft'
        },
        edges: [],
        idempotency_key: `document:${fileName}:${projectId}`,
        audit_context: { action: 'upload_document', user_id: (session.user as any).id }
      }

      const result = await upsertAssetsAndEdges(spec, (session.user as any).id)
      documentAssets.push({ id: result.id, fileName })
    }

    // Trigger LangGraph V10 processing - NO MOCK DATA
    try {
      const langGraphResult = await triggerProjectProcessingViaLangGraphEnhanced(
        projectId,
        documentAssets.map(doc => doc.id)
      )

      return NextResponse.json({
        message: 'LangGraph V10 processing initiated successfully',
        documents: documentAssets,
        langgraph: {
          thread_id: langGraphResult.thread_id,
          run_id: langGraphResult.run_id,
          run_uid: langGraphResult.run_uid
        }
      })
    } catch (langGraphError) {
      console.error('LangGraph V10 processing failed:', langGraphError)
      return NextResponse.json({
        message: 'Documents uploaded but LangGraph processing failed',
        documents: documentAssets,
        error: (langGraphError as any)?.message || 'Unknown error'
      }, { status: 207 }) // Multi-status response
    }
  } catch (error) {
    console.error('Error processing uploads:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}