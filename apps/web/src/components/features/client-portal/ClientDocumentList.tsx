import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download, Eye } from 'lucide-react'

interface ClientDocumentListProps {
  projectId: string
}

export default function ClientDocumentList({ projectId }: ClientDocumentListProps) {
  const documents = [
    {
      id: '1',
      name: 'Quality Control Plan',
      type: 'PDF',
      size: '2.3 MB',
      uploadedAt: '2024-01-15',
      status: 'Approved'
    },
    {
      id: '2',
      name: 'Safety Management Plan',
      type: 'PDF',
      size: '1.8 MB',
      uploadedAt: '2024-01-10',
      status: 'Approved'
    },
    {
      id: '3',
      name: 'ITP Template',
      type: 'DOCX',
      size: '856 KB',
      uploadedAt: '2024-01-08',
      status: 'Pending Review'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Project Documents</h1>
        <p className="text-muted-foreground mt-2">Access approved project documentation</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Documents</CardTitle>
          <CardDescription>
            Documents approved for client access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {doc.type} • {doc.size} • Uploaded {doc.uploadedAt}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    doc.status === 'Approved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {doc.status}
                  </span>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
