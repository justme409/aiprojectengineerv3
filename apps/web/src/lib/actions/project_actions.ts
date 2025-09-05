import { z } from "zod"
import { BaseAction, ActionResult, ActionContext } from "./base"

const CreateProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  location: z.string().optional(),
  clientName: z.string().optional(),
  settings: z.record(z.any()).optional(),
})

const UpdateProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  clientName: z.string().optional(),
  settings: z.record(z.any()).optional(),
})

const ProjectFilterSchema = z.object({
  organizationId: z.string().optional(),
  status: z.string().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
})

export class ProjectActions extends BaseAction {
  constructor(context: ActionContext = {}) {
    super(context)
  }

  async createProject(input: z.infer<typeof CreateProjectSchema>): Promise<ActionResult> {
    try {
      const hasPermission = await this.validatePermissions(['project.create'])
      if (!hasPermission) {
        return this.createError('Insufficient permissions to create project')
      }

      const validatedData = CreateProjectSchema.parse(input)

      const response = await this.callAPIWithAuth('/projects', {
        method: 'POST',
        body: JSON.stringify({
          ...validatedData,
          organizationId: this.context.organizationId,
          createdByUserId: this.context.userId,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        return this.createError(`Failed to create project: ${error}`)
      }

      const project = await response.json()
      return this.createResult(project, 'Project created successfully')
    } catch (error) {
      if (error instanceof z.ZodError) {
        return this.createError(`Validation error: ${error.message}`)
      }
      return this.createError(`Unexpected error: ${error}`)
    }
  }

  async updateProject(input: z.infer<typeof UpdateProjectSchema>): Promise<ActionResult> {
    try {
      const hasPermission = await this.validatePermissions(['project.update'])
      if (!hasPermission) {
        return this.createError('Insufficient permissions to update project')
      }

      const validatedData = UpdateProjectSchema.parse(input)

      const response = await this.callAPIWithAuth(`/projects/${input.id}`, {
        method: 'PUT',
        body: JSON.stringify(validatedData),
      })

      if (!response.ok) {
        const error = await response.text()
        return this.createError(`Failed to update project: ${error}`)
      }

      const project = await response.json()
      return this.createResult(project, 'Project updated successfully')
    } catch (error) {
      if (error instanceof z.ZodError) {
        return this.createError(`Validation error: ${error.message}`)
      }
      return this.createError(`Unexpected error: ${error}`)
    }
  }

  async getProjects(filters: z.infer<typeof ProjectFilterSchema> = {}): Promise<ActionResult> {
    try {
      const hasPermission = await this.validatePermissions(['project.read'])
      if (!hasPermission) {
        return this.createError('Insufficient permissions to view projects')
      }

      const validatedFilters = ProjectFilterSchema.parse(filters)
      const queryParams = new URLSearchParams()

      if (validatedFilters.organizationId) {
        queryParams.append('organizationId', validatedFilters.organizationId)
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
      const endpoint = `/projects${queryString ? `?${queryString}` : ''}`

      const response = await this.callAPIWithAuth(endpoint)

      if (!response.ok) {
        const error = await response.text()
        return this.createError(`Failed to fetch projects: ${error}`)
      }

      const projects = await response.json()
      return this.createResult(projects)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return this.createError(`Validation error: ${error.message}`)
      }
      return this.createError(`Unexpected error: ${error}`)
    }
  }

  async getProjectById(projectId: string): Promise<ActionResult> {
    try {
      const hasPermission = await this.validatePermissions(['project.read'])
      if (!hasPermission) {
        return this.createError('Insufficient permissions to view project')
      }

      const response = await this.callAPIWithAuth(`/projects/${projectId}`)

      if (!response.ok) {
        const error = await response.text()
        return this.createError(`Failed to fetch project: ${error}`)
      }

      const project = await response.json()
      return this.createResult(project)
    } catch (error) {
      return this.createError(`Unexpected error: ${error}`)
    }
  }

  async deleteProject(projectId: string): Promise<ActionResult> {
    try {
      const hasPermission = await this.validatePermissions(['project.delete'])
      if (!hasPermission) {
        return this.createError('Insufficient permissions to delete project')
      }

      const response = await this.callAPIWithAuth(`/projects/${projectId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.text()
        return this.createError(`Failed to delete project: ${error}`)
      }

      return this.createResult(null, 'Project deleted successfully')
    } catch (error) {
      return this.createError(`Unexpected error: ${error}`)
    }
  }

  async getProjectMembers(projectId: string): Promise<ActionResult> {
    try {
      const hasPermission = await this.validatePermissions(['project.read'])
      if (!hasPermission) {
        return this.createError('Insufficient permissions to view project members')
      }

      const response = await this.callAPIWithAuth(`/projects/${projectId}/members`)

      if (!response.ok) {
        const error = await response.text()
        return this.createError(`Failed to fetch project members: ${error}`)
      }

      const members = await response.json()
      return this.createResult(members)
    } catch (error) {
      return this.createError(`Unexpected error: ${error}`)
    }
  }

  async addProjectMember(projectId: string, userId: string, roleId: string): Promise<ActionResult> {
    try {
      const hasPermission = await this.validatePermissions(['project.manage_members'])
      if (!hasPermission) {
        return this.createError('Insufficient permissions to manage project members')
      }

      const response = await this.callAPIWithAuth(`/projects/${projectId}/members`, {
        method: 'POST',
        body: JSON.stringify({ userId, roleId }),
      })

      if (!response.ok) {
        const error = await response.text()
        return this.createError(`Failed to add project member: ${error}`)
      }

      const member = await response.json()
      return this.createResult(member, 'Project member added successfully')
    } catch (error) {
      return this.createError(`Unexpected error: ${error}`)
    }
  }

  async removeProjectMember(projectId: string, userId: string): Promise<ActionResult> {
    try {
      const hasPermission = await this.validatePermissions(['project.manage_members'])
      if (!hasPermission) {
        return this.createError('Insufficient permissions to manage project members')
      }

      const response = await this.callAPIWithAuth(`/projects/${projectId}/members/${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.text()
        return this.createError(`Failed to remove project member: ${error}`)
      }

      return this.createResult(null, 'Project member removed successfully')
    } catch (error) {
      return this.createError(`Unexpected error: ${error}`)
    }
  }
}
