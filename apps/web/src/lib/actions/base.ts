import { z } from "zod"

export interface ActionResult<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ActionContext {
  userId?: string
  organizationId?: string
  projectId?: string
  userRole?: string
  permissions?: string[]
}

export abstract class BaseAction {
  protected context: ActionContext

  constructor(context: ActionContext = {}) {
    this.context = context
  }

  protected async validatePermissions(requiredPermissions: string[]): Promise<boolean> {
    if (!this.context.permissions) return false
    return requiredPermissions.every(permission =>
      this.context.permissions!.includes(permission)
    )
  }

  protected createResult<T>(data: T, message?: string): ActionResult<T> {
    return {
      success: true,
      data,
      message
    }
  }

  protected createError(error: string): ActionResult {
    return {
      success: false,
      error
    }
  }

  protected async callAPI(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1'
    const url = `${baseUrl}${endpoint}`

    const defaultHeaders = {
      'Content-Type': 'application/json',
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    })

    return response
  }

  protected async callAPIWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
    // In a real implementation, this would get the auth token from context/storage
    const authToken = this.getAuthToken()

    return this.callAPI(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
    })
  }

  private getAuthToken(): string | null {
    // This would typically get the token from localStorage, cookies, or context
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return null
  }
}
