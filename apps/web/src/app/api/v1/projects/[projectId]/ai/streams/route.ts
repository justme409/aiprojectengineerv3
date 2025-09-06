import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = await params
    const { searchParams } = new URL(request.url)
    const runId = searchParams.get('runId')

    if (!runId) {
      return NextResponse.json({ error: 'runId parameter required' }, { status: 400 })
    }

    // This would connect to LangGraph Server v10 for real-time streaming
    // For now, return a mock response
    const stream = new ReadableStream({
      start(controller) {
        // Mock streaming events
        const events = [
          { event: 'start', data: { run_id: runId, status: 'running' } },
          { event: 'node_start', data: { node: 'document_extraction', status: 'running' } },
          { event: 'node_complete', data: { node: 'document_extraction', status: 'completed', output: { documents_processed: 5 } } },
          { event: 'node_start', data: { node: 'project_details', status: 'running' } },
          { event: 'node_complete', data: { node: 'project_details', status: 'completed', output: { project_name: 'Test Project' } } },
          { event: 'complete', data: { run_id: runId, status: 'completed', final_output: { wbs_nodes: 25, lots: 10 } } }
        ]

        let index = 0
        const interval = setInterval(() => {
          if (index < events.length) {
            controller.enqueue(`data: ${JSON.stringify(events[index])}\n\n`)
            index++
          } else {
            controller.enqueue('data: [DONE]\n\n')
            controller.close()
            clearInterval(interval)
          }
        }, 1000)
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })
  } catch (error) {
    console.error('Error streaming AI events:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}