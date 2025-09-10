'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface QseDocViewerProps {
  docId?: string
  docPath: string
}

interface QseDocument {
  id: string
  name: string
  type: string
  content: any
  status: string
  created_at: string
  updated_at: string
}

export default function QseDocViewer({ docId, docPath }: QseDocViewerProps) {
  const [document, setDocument] = useState<QseDocument | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/v1/qse/${docId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch document')
        }

        const data = await response.json()
        setDocument(data.document)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load document')
      } finally {
        setLoading(false)
      }
    }

    if (docId) {
      fetchDocument()
    } else {
      setLoading(false)
    }
  }, [docId])

  // Convert path to readable title (fallback)
  const titleFromPath = docPath
    .replace('corp-', '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  const title = document?.name || titleFromPath

  const renderDocumentContent = () => {
    if (!document?.content) {
      return (
        <div className="text-center text-muted-foreground">
          <FileText className="mx-auto h-12 w-12 mb-4" />
          <p>No content available for this document</p>
        </div>
      )
    }

    // Render different content types appropriately
    const content = document.content

    switch (document.type) {
      case 'policy':
        return (
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold mb-4">{content.title || document.name}</h2>
            {content.purpose && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Purpose</h3>
                <p className="text-gray-700">{content.purpose}</p>
              </div>
            )}
            {content.scope && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Scope</h3>
                <p className="text-gray-700">{content.scope}</p>
              </div>
            )}
            {content.requirements && Array.isArray(content.requirements) && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                <ul className="list-disc list-inside space-y-1">
                  {content.requirements.map((req: string, index: number) => (
                    <li key={index} className="text-gray-700">{req}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )

      case 'procedure':
        return (
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold mb-4">{content.title || document.name}</h2>
            {content.objective && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Objective</h3>
                <p className="text-gray-700">{content.objective}</p>
              </div>
            )}
            {content.steps && Array.isArray(content.steps) && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Procedure Steps</h3>
                <ol className="list-decimal list-inside space-y-2">
                  {content.steps.map((step: string, index: number) => (
                    <li key={index} className="text-gray-700">{step}</li>
                  ))}
                </ol>
              </div>
            )}
            {content.responsibilities && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Responsibilities</h3>
                <p className="text-gray-700">{content.responsibilities}</p>
              </div>
            )}
          </div>
        )

      case 'form':
      case 'template':
        return (
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold mb-4">{content.title || document.name}</h2>
            {content.description && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700">{content.description}</p>
              </div>
            )}
            {content.fields && Array.isArray(content.fields) && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Form Fields</h3>
                <div className="space-y-2">
                  {content.fields.map((field: any, index: number) => (
                    <div key={index} className="border rounded p-3">
                      <div className="font-medium">{field.name}</div>
                      <div className="text-sm text-gray-600">{field.type} - {field.required ? 'Required' : 'Optional'}</div>
                      {field.description && (
                        <div className="text-sm text-gray-500 mt-1">{field.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      default:
        return (
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold mb-4">{document.name}</h2>
            <pre className="whitespace-pre-wrap text-gray-700">
              {JSON.stringify(content, null, 2)}
            </pre>
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{titleFromPath}</h1>
          <p className="text-muted-foreground mt-2">
            Corporate QSE documentation and procedures
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading document...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If no docId provided, show information about the document category
  if (!docId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{titleFromPath}</h1>
          <p className="text-muted-foreground mt-2">
            Corporate QSE documentation and procedures
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Document Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{titleFromPath}</h3>
                    <p className="text-sm text-muted-foreground">
                      QSE corporate documentation category - {docPath}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-6 min-h-[400px] bg-white">
                <div className="text-center text-muted-foreground">
                  <FileText className="mx-auto h-12 w-12 mb-4" />
                  <p>Select a specific document from this category to view its contents</p>
                  <p className="text-sm mt-2">
                    Navigate to the QSE main page to browse available documents in the {titleFromPath} category
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground mt-2">
            Corporate QSE documentation and procedures
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>Error loading document: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground mt-2">
          Corporate QSE documentation and procedures
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Document Viewer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Type: {document?.type} | Status: {document?.status} | Last updated: {document ? new Date(document.updated_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>

            <div className="border rounded-lg p-6 min-h-[400px] bg-white">
              {renderDocumentContent()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
