"use client"
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

export default function NewProjectUploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [projectId, setProjectId] = useState<string | null>(null)
  const [status, setStatus] = useState<string>("")
  const [running, setRunning] = useState<boolean>(false)

  const onPickFiles = () => fileInputRef.current?.click()

  const onFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    setFiles(selected)
  }

  const start = async () => {
    if (files.length === 0) return
    setRunning(true)
    setStatus('Creating project...')
    try {
      // 1) Create placeholder project (no form fields)
      const createRes = await fetch('/api/v1/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      if (!createRes.ok) throw new Error('Failed to create project')
      const { project } = await createRes.json()
      const pid = project.id as string
      setProjectId(pid)

      // 2) Get SAS URLs
      setStatus('Preparing secure upload links...')
      const sasRes = await fetch(`/api/v1/projects/${pid}/uploads/azure-sas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: files.map(f => ({ name: f.name, contentType: f.type, size: f.size })) })
      })
      if (!sasRes.ok) throw new Error('Failed to get SAS URLs')
      const { uploads } = await sasRes.json()

      // 3) Upload each file via SAS
      setStatus('Uploading files...')
      for (let i = 0; i < files.length; i++) {
        const f = files[i]
        const u = uploads[i]
        const put = await fetch(u.uploadUrl, { method: 'PUT', headers: { 'x-ms-blob-type': 'BlockBlob', 'Content-Type': f.type || 'application/octet-stream' }, body: f })
        if (!put.ok) throw new Error(`Upload failed for ${f.name}`)
      }

      // 4) Notify complete -> this will create document assets and trigger processing; returns run_uid
      setStatus('Starting AI processing...')
      const notifyRes = await fetch(`/api/v1/projects/${pid}/uploads/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: uploads.map((u: any) => ({ fileName: u.filename, blobName: u.blobName, contentType: files.find(f => f.name === u.filename)?.type, size: files.find(f => f.name === u.filename)?.size })) })
      })
      if (!notifyRes.ok && notifyRes.status !== 207) throw new Error('Failed to finalize uploads')
      const notifyJson = await notifyRes.json()

      const runUid = notifyJson?.langgraph?.run_uid
      if (!runUid) {
        setStatus('Processing started, but run UID not available. You can check the documents page.')
        return
      }

      // 5) Stream status
      setStatus('Connected to AI processing stream...')
      const es = new EventSource(`/api/v1/projects/${pid}/ai/streams?runId=${encodeURIComponent(runUid)}`)
      es.onmessage = (evt) => {
        if (evt.data === '[DONE]') {
          setStatus('Processing complete.')
          es.close()
          setRunning(false)
          return
        }
        try {
          const msg = JSON.parse(evt.data)
          if (msg?.event === 'node_start') setStatus(`Running: ${msg.data?.node}`)
          if (msg?.event === 'node_complete') setStatus(`Completed: ${msg.data?.node}`)
          if (msg?.event === 'complete') { setStatus('Processing complete.'); es.close(); setRunning(false) }
        } catch {}
      }
      es.onerror = () => {
        setStatus('Stream error; processing will continue in background.')
        es.close()
        setRunning(false)
      }
    } catch (e: any) {
      setStatus(e?.message || 'Error occurred')
      setRunning(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">New Project</h1>
      <p className="text-sm text-muted-foreground mb-6">Upload your project documents. A project will be created automatically and processed by AI.</p>

      <div className="border-2 border-dashed rounded-md p-6 mb-4">
        <div className="mb-3">
          <Button variant="outline" onClick={onPickFiles} disabled={running}>Select Files</Button>
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={onFilesSelected} />
        </div>
        {files.length > 0 && (
          <ul className="text-sm list-disc ml-5">
            {files.map(f => (<li key={f.name}>{f.name} ({(f.size/1024/1024).toFixed(2)} MB)</li>))}
          </ul>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={start} disabled={running || files.length === 0}>{running ? 'Processing...' : 'Create & Upload'}</Button>
        {status && <span className="text-sm text-muted-foreground">{status}{projectId ? ` (Project: ${projectId.slice(0,8)})` : ''}</span>}
      </div>
    </div>
  )
}

