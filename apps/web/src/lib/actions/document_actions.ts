import { z } from "zod"
import { BaseAction, ActionResult, ActionContext } from "./base"

const UploadDocumentSchema = z.object({
  projectId: z.string(),
  file: z.any(), // File object
  documentNumber: z.string().optional(),
  revisionCode: z.string().optional(),
  docType: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

const DocumentFilterSchema = z.object({
  projectId: z.string().optional(),
  docType: z.string().optional(),
  status: z.string().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
})

export class DocumentActions extends BaseAction {
  constructor(context: ActionContext = {}) {
    super(context)
  }

  async uploadDocument(input: z.infer<typeof UploadDocumentSchema>): Promise<ActionResult> {
    try {
      const hasPermission = await this.validatePermissions(['document.upload'])
      if (!hasPermission) {
        return this.createError('Insufficient permissions to upload document')
      }

      const validatedData = UploadDocumentSchema.parse(input)

      // First, get upload URL from Azure
      const uploadUrlResponse = await this.callAPIWithAuth(
        `/projects/${input.projectId}/uploads/azure-sas`,
        {
          method: 'POST',
          body: JSON.stringify({
            fileName: input.file.name,
            contentType: input.file.type,
          }),
        }
      )

      if (!uploadUrlResponse.ok) {
        return this.createError('Failed to get upload URL')
      }

      const { uploadUrl, blobUrl } = await uploadUrlResponse.json()

      // Upload file to Azure
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: input.file,
        headers: {
          'Content-Type': input.file.type,
          'x-ms-blob-type': 'BlockBlob',
        },
      })

      if (!uploadResponse.ok) {
        return this.createError('Failed to upload file to storage')
      }

      // Notify backend that upload is complete
      const completeResponse = await this.callAPIWithAuth(
        `/projects/${input.projectId}/uploads/complete`,
        {
          method: 'POST',
          body: JSON.stringify({
            blobUrl,
            fileName: input.file.name,
            contentType: input.file.type,
            size: input.file.size,
            documentNumber: input.documentNumber,
            revisionCode: input.revisionCode,
            docType: input.docType,
            metadata: input.metadata,
          }),
        }
      )

      if (!completeResponse.ok) {
        const error = await completeResponse.text()
        return this.createError(`Failed to complete document upload: ${error}`)
      }

      const document = await completeResponse.json()
      return this.createResult(document, 'Document uploaded successfully')
    } catch (error) {
      if (error instanceof z.ZodError) {
        return this.createError(`Validation error: ${error.message}`)
      }
      return this.createError(`Unexpected error: ${error}`)
    }
  }

  async getDocuments(filters: z.infer<typeof DocumentFilterSchema> = {}): Promise<ActionResult> {
    try {
      const hasPermission = await this.validatePermissions(['document.read'])
      if (!hasPermission) {
        return this.createError('Insufficient permissions to view documents')
      }

      const validatedFilters = DocumentFilterSchema.parse(filters)
      const queryParams = new URLSearchParams()

      if (validatedFilters.projectId) {
        queryParams.append('projectId', validatedFilters.projectId)
      }
      if (validatedFilters.docType) {
        queryParams.append('docType', validatedFilters.docType)
      }
      if (validatedFilters.status) {
        queryParams.append('status', validatedFilters.status)
      }
      if (validatedFilters.limit) {
        queryParams.append('limit', validatedFilters.limit.toString())
      }
      if (validatedFilters.offset) {
        queryParams.append('offset', validatedFilters.offset.toString())
      }

      const queryString = queryParams.toString()
      const endpoint = `/documents${queryString ? `?${queryString}` : ''}`

      const response = await this.callAPIWithAuth(endpoint)

      if (!response.ok) {
        const error = await response.text()
        return this.createError(`Failed to fetch documents: ${error}`)
      }

      const documents = await response.json()
      return this.createResult(documents)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return this.createError(`Validation error: ${error.message}`)
      }
      return this.createError(`Unexpected error: ${error}`)
    }
  }

  async getDocumentById(documentId: string): Promise<ActionResult> {
    try {
      const hasPermission = await this.validatePermissions(['document.read'])
      if (!hasPermission) {
        return this.createError('Insufficient permissions to view document')
      }

      const response = await this.callAPIWithAuth(`/documents/${documentId}`)

      if (!response.ok) {
        const error = await response.text()
        return this.createError(`Failed to fetch document: ${error}`)
      }

      const document = await response.json()
      return this.createResult(document)
    } catch (error) {
      return this.createError(`Unexpected error: ${error}`)
    }
  }

  async updateDocument(documentId: string, updates: Record<string, any>): Promise<ActionResult> {
    try {
      const hasPermission = await this.validatePermissions(['document.update'])
      if (!hasPermission) {
        return this.createError('Insufficient permissions to update document')
      }

      const response = await this.callAPIWithAuth(`/documents/${documentId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const error = await response.text()
        return this.createError(`Failed to update document: ${error}`)
      }

      const document = await response.json()
      return this.createResult(document, 'Document updated successfully')
    } catch (error) {
      return this.createError(`Unexpected error: ${error}`)
    }
  }

  async deleteDocument(documentId: string): Promise<ActionResult> {
    try {
      const hasPermission = await this.validatePermissions(['document.delete'])
      if (!hasPermission) {
        return this.createError('Insufficient permissions to delete document')
      }

      const response = await this.callAPIWithAuth(`/documents/${documentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.text()
        return this.createError(`Failed to delete document: ${error}`)
      }

      return this.createResult(null, 'Document deleted successfully')
    } catch (error) {
      return this.createError(`Unexpected error: ${error}`)
    }
  }

  async processDocument(documentId: string): Promise<ActionResult> {
    try {
      const hasPermission = await this.validatePermissions(['document.process'])
      if (!hasPermission) {
        return this.createError('Insufficient permissions to process document')
      }

      const response = await this.callAPIWithAuth(`/documents/${documentId}/process`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.text()
        return this.createError(`Failed to process document: ${error}`)
      }

      return this.createResult(null, 'Document processing started')
    } catch (error) {
      return this.createError(`Unexpected error: ${error}`)
    }
  }

  async getDocumentProcessingStatus(documentId: string): Promise<ActionResult> {
    try {
      const hasPermission = await this.validatePermissions(['document.read'])
      if (!hasPermission) {
        return this.createError('Insufficient permissions to view document status')
      }

      const response = await this.callAPIWithAuth(`/documents/${documentId}/status`)

      if (!response.ok) {
        const error = await response.text()
        return this.createError(`Failed to get document status: ${error}`)
      }

      const status = await response.json()
      return this.createResult(status)
    } catch (error) {
      return this.createError(`Unexpected error: ${error}`)
    }
  }
}
