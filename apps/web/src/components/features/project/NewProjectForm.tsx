"use client"

import { useState } from 'react'

export default function NewProjectForm() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [clientName, setClientName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/v1/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, location, client_name: clientName })
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Request failed: ${res.status}`)
      }
      window.location.href = '/projects'
    } catch (err: any) {
      setError(err.message || 'Failed to create project')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input className="w-full border rounded p-2" value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea className="w-full border rounded p-2" value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input className="w-full border rounded p-2" value={location} onChange={e => setLocation(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Client</label>
          <input className="w-full border rounded p-2" value={clientName} onChange={e => setClientName(e.target.value)} />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" className="bg-primary text-white px-4 py-2 rounded disabled:opacity-50" disabled={submitting}>
        {submitting ? 'Creating...' : 'Create project'}
      </button>
    </form>
  )
}


