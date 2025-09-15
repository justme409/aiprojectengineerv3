import Link from 'next/link'

interface ItpTemplateDetailClientProps {
  template: any
  projectId: string
  templateId: string
  projectName: string
  lot?: any
  lotId?: string
  isClientPortal?: boolean
}

export default function ItpTemplateDetailClient({
  template,
  projectId,
  templateId,
  projectName
}: ItpTemplateDetailClientProps) {
  if (!template) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Template Not Found</h3>
            <p className="text-muted-foreground">
              The requested ITP template could not be found.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/projects/${projectId}/quality/itp-templates`}
            className="text-sm text-muted-foreground hover:underline flex items-center mb-4"
          >
            ← Back to ITP Templates for {projectName}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {template.name}
          </h1>
          <p className="text-gray-600 mt-2">
            ITP template details and inspection/test plan items.
          </p>
        </div>

        <div className="space-y-6">
          {/* Template Overview */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">{template.name}</h2>
              <div className="flex items-center space-x-2 mt-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  template.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  template.status === 'approved' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {template.status}
                </span>
                {template.content?.version && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    Version {template.content.version}
                  </span>
                )}
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <p><strong>Project:</strong> {projectName}</p>
                  <p><strong>Status:</strong> {template.status}</p>
                  <p><strong>Created:</strong> {new Date(template.created_at).toLocaleDateString()}</p>
                  <p><strong>Last Updated:</strong> {new Date(template.updated_at).toLocaleDateString()}</p>
                </div>
              </div>

              {template.content?.description && (
                <>
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-lg mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {template.content.description}
                    </p>
                  </div>
                </>
              )}

              {template.content?.applicability_notes && (
                <>
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-lg mb-2">Applicability Notes</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {template.content.applicability_notes}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ITP Items */}
          {template.content?.items && template.content.items.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Inspection and Test Plan Items</h2>
                <p className="text-gray-600 mt-1">
                  {template.content.items.length} items in this ITP template
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {template.content.items.map((item: any, index: number) => (
                    <div key={item.id || index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">
                          {item.code}: {item.title}
                        </h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          item.point_type === 'hold' ? 'bg-red-100 text-red-800' :
                          item.point_type === 'witness' ? 'bg-blue-100 text-blue-800' :
                          item.point_type === 'surveillance' ? 'bg-purple-100 text-purple-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {item.point_type}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      )}
                      {item.acceptance_criteria && (
                        <div className="text-sm">
                          <strong>Acceptance Criteria:</strong> {item.acceptance_criteria}
                        </div>
                      )}
                      {item.required_records && item.required_records.length > 0 && (
                        <div className="text-sm mt-2">
                          <strong>Required Records:</strong> {item.required_records.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
