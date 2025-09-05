import { z } from "zod"
import { BaseAction, ActionResult, ActionContext } from "./base"

const CreateQseDocumentSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  type: z.string(),
  category: z.string(),
  section: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

const UpdateQseDocumentSchema = z.object({
  id: z.string(),
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  type: z.string().optional(),
  category: z.string().optional(),
  section: z.string().optional(),
  status: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

const QseDocumentFilterSchema = z.object({
  type: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
})

export class QseActions extends BaseAction {
  constructor(context: ActionContext = {}) {
    super(context)
  }

  async createQseDocument(input: z.infer<typeof CreateQseDocumentSchema>): Promise<ActionResult> {
    try {
      const hasPermission = await this.validatePermissions(['qse.manage'])
      if (!hasPermission) {
        return this.createError('Insufficient permissions to create QSE document')
      }

      const validatedData = CreateQseDocumentSchema.parse(input)

      const response = await this.callAPIWithAuth('/qse', {
        method: 'POST',
        body: JSON.stringify({
          ...validatedData,
          organizationId: this.context.organizationId,
          createdBy: this.context.userId,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        return this.createError(`Failed to create QSE document: ${error}`)
      }

      const document = await response.json()
      return this.createResult(document, 'QSE document created successfully')
    } catch (error) {
      if (error instanceof z.ZodError) {
        return this.createError(`Validation error: ${error.message}`)
      }
      return this.createError(`Unexpected error: ${error}`)
    }
  }

  async updateQseDocument(input: z.infer<typeof UpdateQseDocumentSchema>): Promise<ActionResult> {
    try {
      const hasPermission = await this.validatePermissions(['qse.manage'])
      if (!hasPermission) {
        return this.createError('Insufficient permissions to update QSE document')
      }

      const validatedData = UpdateQseDocumentSchema.parse(input)

      const response = await this.callAPIWithAuth(`/qse/${input.id}`, {
        method: 'PUT',
        body: JSON.stringify(validatedData),
      })

      if (!response.ok) {
        const error = await response.text()
        return this.createError(`Failed to update QSE document: ${error}`)
      }

      const document = await response.json()
      return this.createResult(document, 'QSE document updated successfully')
    } catch (error) {
      if (error instanceof z.ZodError) {
        return this.createError(`Validation error: ${error.message}`)
      }
      return this.createError(`Unexpected error: ${error}`)
    }
  }

  async getQseDocuments(filters: z.infer<typeof QseDocumentFilterSchema> = {}): Promise<ActionResult> {
    try {
      const hasPermission = await this.validatePermissions(['qse.read'])
      if (!hasPermission) {
        return this.createError('Insufficient permissions to view QSE documents')
      }

      const validatedFilters = QseDocumentFilterSchema.parse(filters)
      const queryParams = new URLSearchParams()

      if (validatedFilters.type) {
        queryParams.append('type', validatedFilters.type)
      }
      if (validatedFilters.category) {
        queryParams.append('category', validatedFilters.category)
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
      const endpoint = `/qse${queryString ? `?${queryString}` : ''}`

      const response = await this.callAPIWithAuth(endpoint)

      if (!response.ok) {
        const error = await response.text()
        return this.createError(`Failed to fetch QSE documents: ${error}`)
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

  async getQseDocumentById(documentId: string): Promise<ActionResult> {
    try {
      const hasPermission = await this.validatePermissions(['qse.read'])
      if (!hasPermission) {
        return this.createError('Insufficient permissions to view QSE document')
      }

      const response = await this.callAPIWithAuth(`/qse/${documentId}`)

      if (!response.ok) {
        const error = await response.text()
        return this.createError(`Failed to fetch QSE document: ${error}`)
      }

      const document = await response.json()
      return this.createResult(document)
    } catch (error) {
      return this.createError(`Unexpected error: ${error}`)
    }
  }

  async deleteQseDocument(documentId: string): Promise<ActionResult> {
    try {
      const hasPermission = await this.validatePermissions(['qse.manage'])
      if (!hasPermission) {
        return this.createError('Insufficient permissions to delete QSE document')
      }

      const response = await this.callAPIWithAuth(`/qse/${documentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.text()
        return this.createError(`Failed to delete QSE document: ${error}`)
      }

      return this.createResult(null, 'QSE document deleted successfully')
    } catch (error) {
      return this.createError(`Unexpected error: ${error}`)
    }
  }

  async approveQseDocument(documentId: string, approvalNote?: string): Promise<ActionResult> {
    try {
      const hasPermission = await this.validatePermissions(['qse.approve'])
      if (!hasPermission) {
        return this.createError('Insufficient permissions to approve QSE document')
      }

      const response = await this.callAPIWithAuth(`/qse/${documentId}/approve`, {
        method: 'POST',
        body: JSON.stringify({
          approvedBy: this.context.userId,
          approvalNote,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        return this.createError(`Failed to approve QSE document: ${error}`)
      }

      const document = await response.json()
      return this.createResult(document, 'QSE document approved successfully')
    } catch (error) {
      return this.createError(`Unexpected error: ${error}`)
    }
  }

  async rejectQseDocument(documentId: string, rejectionReason: string): Promise<ActionResult> {
    try {
      const hasPermission = await this.validatePermissions(['qse.approve'])
      if (!hasPermission) {
        return this.createError('Insufficient permissions to reject QSE document')
      }

      const response = await this.callAPIWithAuth(`/qse/${documentId}/reject`, {
        method: 'POST',
        body: JSON.stringify({
          rejectedBy: this.context.userId,
          rejectionReason,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        return this.createError(`Failed to reject QSE document: ${error}`)
      }

      const document = await response.json()
      return this.createResult(document, 'QSE document rejected')
    } catch (error) {
      return this.createError(`Unexpected error: ${error}`)
    }
  }

  async getQseDocumentHistory(documentId: string): Promise<ActionResult> {
    try {
      const hasPermission = await this.validatePermissions(['qse.read'])
      if (!hasPermission) {
        return this.createError('Insufficient permissions to view QSE document history')
      }

      const response = await this.callAPIWithAuth(`/qse/${documentId}/history`)

      if (!response.ok) {
        const error = await response.text()
        return this.createError(`Failed to fetch QSE document history: ${error}`)
      }

      const history = await response.json()
      return this.createResult(history)
    } catch (error) {
      return this.createError(`Unexpected error: ${error}`)
    }
  }
}
