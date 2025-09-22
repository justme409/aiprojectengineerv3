export default function ItpDocumentDetailClient({ itp, projectId, itpId, projectName }: { itp: any, projectId: string, itpId: string, projectName: string }) {
  if (!itp) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">ITP Not Found</h3>
            <p className="text-muted-foreground">The requested ITP document could not be found.</p>
          </div>
        </div>
      </div>
    )
  }

  const items = itp.content?.itp_items || itp.content?.items || []
  const points = itp.content?.inspection_points || []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <a
            href={`/projects/${projectId}/quality/itp-register`}
            className="text-sm text-muted-foreground hover:underline flex items-center mb-4"
          >
            ← Back to ITP Register for {projectName}
          </a>
          <h1 className="text-3xl font-bold text-gray-900">{itp.name}</h1>
          <p className="text-gray-600 mt-2">Inspection and Test Plan details.</p>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Overview</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <p><strong>Project:</strong> {projectName}</p>
              <p><strong>Status:</strong> {itp.status}</p>
              <p><strong>Created:</strong> {new Date(itp.created_at).toLocaleDateString()}</p>
              <p><strong>Last Updated:</strong> {new Date(itp.updated_at).toLocaleDateString()}</p>
              {itp.document_number && <p><strong>Document No.:</strong> {itp.document_number}</p>}
              {itp.revision_code && <p><strong>Revision:</strong> {itp.revision_code}</p>}
            </div>
          </div>

          {items.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Inspection and Test Plan Items</h2>
                <p className="text-gray-600 mt-1">{items.length} items in this ITP</p>
              </div>
              <div className="p-6 space-y-4">
                {items.map((item: any, index: number) => (
                  <div key={item.id || index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        {item.item_no || item.code || index + 1}: {item.section_name || item.inspection_test_point || item.title}
                      </h4>
                      {item.hold_witness_point && (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">
                          {item.hold_witness_point}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                    )}
                    {item.acceptance_criteria && (
                      <div className="text-sm"><strong>Acceptance Criteria:</strong> {item.acceptance_criteria}</div>
                    )}
                    {item.inspection_test_method && (
                      <div className="text-sm"><strong>Test Method:</strong> {item.inspection_test_method}</div>
                    )}
                    {item.frequency && (
                      <div className="text-sm"><strong>Frequency:</strong> {item.frequency}</div>
                    )}
                    {item.responsibility && (
                      <div className="text-sm"><strong>Responsibility:</strong> {item.responsibility}</div>
                    )}
                    {item.specification_clause && (
                      <div className="text-sm"><strong>Spec Clause:</strong> {item.specification_clause}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {points.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Extracted Inspection Points</h2>
                <p className="text-gray-600 mt-1">{points.length} points</p>
              </div>
              <div className="p-6 space-y-4">
                {points.map((p: any, idx: number) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                    <div className="font-medium text-gray-900 mb-1">{p.point_description}</div>
                    {p.acceptance_criteria && <div className="text-sm"><strong>Criteria:</strong> {p.acceptance_criteria}</div>}
                    {p.test_method && <div className="text-sm"><strong>Method:</strong> {p.test_method}</div>}
                    {p.frequency && <div className="text-sm"><strong>Frequency:</strong> {p.frequency}</div>}
                    {p.hold_witness && <div className="text-sm"><strong>Hold/Witness:</strong> {p.hold_witness}</div>}
                    {p.responsibility && <div className="text-sm"><strong>Responsibility:</strong> {p.responsibility}</div>}
                    {p.standard_reference && <div className="text-sm"><strong>Standard Ref:</strong> {p.standard_reference}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
