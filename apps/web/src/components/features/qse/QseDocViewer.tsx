import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface QseDocViewerProps {
  docPath: string
}

export default function QseDocViewer({ docPath }: QseDocViewerProps) {
  // Convert path to readable title
  const title = docPath
    .replace('corp-', '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

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
                  <h3 className="font-medium">{title} Document</h3>
                  <p className="text-sm text-muted-foreground">
                    QSE corporate documentation - {docPath}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>

            <div className="border rounded-lg p-6 min-h-[400px] bg-white">
              <div className="text-center text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 mb-4" />
                <p>Document content would be displayed here</p>
                <p className="text-sm mt-2">
                  This is a placeholder for the {title} document viewer
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
