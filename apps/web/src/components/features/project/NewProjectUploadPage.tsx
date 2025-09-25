"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle, CheckCircle, Loader2, UploadCloud, X } from 'lucide-react'

export type NewProjectUploadPageProps = {
  userName?: string | null
}

type Stage =
  | 'idle'
  | 'creating_project'
  | 'getting_upload_urls'
  | 'uploading_documents'
  | 'registering_documents'
  | 'triggering_orchestrator'
  | 'processing'
  | 'completed'
  | 'error'

const stageLabels: Record<Stage, string> = {
  idle: 'Ready to start',
  creating_project: 'Creating project workspace',
  getting_upload_urls: 'Preparing secure upload links',
  uploading_documents: 'Uploading documents to secure storage',
  registering_documents: 'Registering documents and metadata',
  triggering_orchestrator: 'Starting orchestrator workflow',
  processing: 'AI orchestrator processing',
  completed: 'Completed',
  error: 'Error encountered',
}

function generateWorkingTitle() {
  const now = new Date()
  const date = now.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  const time = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  return `Draft Project ${date} ${time}`
}

function formatTimestamp(date = new Date()) {
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

interface UploadEntry {
  filename: string
  blobName: string
  uploadUrl: string
  contentType: string
  size: number
}

interface LogEntry {
  id: string
  message: string
  level: 'info' | 'success' | 'warning' | 'error'
  timestamp: string
}

export default function NewProjectUploadPage({ userName }: NewProjectUploadPageProps) {
  const router = useRouter()
  const eventSourceRef = useRef<EventSource | null>(null)
  const isMounted = useRef(true)
  const defaultTitle = useMemo(() => generateWorkingTitle(), [])

  const [workingTitle, setWorkingTitle] = useState(defaultTitle)
  const [files, setFiles] = useState<File[]>([])
  const [stage, setStage] = useState<Stage>('idle')
  const [statusMessage, setStatusMessage] = useState('Upload one or more project documents to begin.')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [projectId, setProjectId] = useState<string | null>(null)
  const [runUid, setRunUid] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [logs, setLogs] = useState<LogEntry[]>([])

  useEffect(() => {
    return () => {
      isMounted.current = false
      eventSourceRef.current?.close()
    }
  }, [])

  const reset = () => {
    eventSourceRef.current?.close()
    eventSourceRef.current = null
    setStage('idle')
    setStatusMessage('Upload one or more project documents to begin.')
    setErrorMessage(null)
    setProjectId(null)
    setRunUid(null)
    setUploadProgress({})
    setLogs([])
  }

  const appendLog = (message: string, level: LogEntry['level'] = 'info') => {
    setLogs((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        message,
        level,
        timestamp: formatTimestamp(),
      },
    ].slice(-50))
  }

  const handleFilesSelected = (fileList: FileList | null) => {
    if (!fileList) return
    const selected = Array.from(fileList)
    setFiles(selected)
    setUploadProgress({})
    appendLog(`Selected ${selected.length} file${selected.length === 1 ? '' : 's'} for upload.`)
  }

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((file) => file.name !== name))
    setUploadProgress((prev) => {
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  const startStream = (project: string, run: string) => {
    eventSourceRef.current?.close()
    const url = `/api/v1/projects/${project}/ai/streams?runId=${encodeURIComponent(run)}`
    const es = new EventSource(url)
    eventSourceRef.current = es

    es.onmessage = (event) => {
      if (!event.data || event.data === '[DONE]') return
      try {
        const payload = JSON.parse(event.data)
        const eventType = payload.event
        const data = payload.data || {}
        switch (eventType) {
          case 'start':
            appendLog('Orchestrator run started.', 'info')
            break
          case 'node_start':
            appendLog(`Running ${data.node || 'step'}...`, 'info')
            break
          case 'node_complete':
            appendLog(`Completed ${data.node || 'step'}.`, 'success')
            break
          case 'complete':
            appendLog('AI orchestration completed.', 'success')
            setStage('completed')
            setStatusMessage('AI processing completed successfully.')
            es.close()
            eventSourceRef.current = null
            break
          case 'error':
            appendLog(data.message || 'Orchestrator reported an error.', 'error')
            setStage('error')
            setErrorMessage(data.error || data.message || 'Orchestrator failed.')
            es.close()
            eventSourceRef.current = null
            break
          default:
            appendLog(`Event: ${eventType}`, 'info')
            break
        }
      } catch (parseError) {
        appendLog('Received malformed streaming data.', 'warning')
      }
    }

    es.onerror = () => {
      appendLog('Lost connection to orchestrator stream.', 'warning')
      if (eventSourceRef.current === es) {
        es.close()
        eventSourceRef.current = null
      }
    }
  }

  const handleStart = async () => {
    if (files.length === 0) {
      setErrorMessage('Select at least one document to continue.')
      return
    }

    setErrorMessage(null)
    setLogs([])
    setStage('creating_project')
    setStatusMessage(stageLabels.creating_project)

    const title = workingTitle.trim() || generateWorkingTitle()

    try {
      const createRes = await fetch('/api/v1/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: title,
          description: null,
          location: null,
          client_name: null,
        }),
      })

      if (!createRes.ok) {
        const message = (await createRes.json().catch(() => ({}))).error || createRes.statusText
        throw new Error(message || 'Failed to create project')
      }

      const createData = await createRes.json()
      const createdProjectId = createData?.project?.id as string | undefined
      if (!createdProjectId) {
        throw new Error('Project creation succeeded without an ID')
      }

      if (!isMounted.current) return

      setProjectId(createdProjectId)
      appendLog('Project workspace created.', 'success')

      setStage('getting_upload_urls')
      setStatusMessage(stageLabels.getting_upload_urls)

      const sasRes = await fetch(`/api/v1/projects/${createdProjectId}/uploads/azure-sas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: files.map((file) => ({
            file_name: file.name,
            content_type: file.type || 'application/octet-stream',
            size: file.size,
          })),
        }),
      })

      if (!sasRes.ok) {
        const message = (await sasRes.json().catch(() => ({}))).error || sasRes.statusText
        throw new Error(message || 'Failed to prepare upload URLs')
      }

      const sasData = await sasRes.json()
      const uploads: UploadEntry[] = (sasData.uploads || []).map((entry: any, index: number) => ({
        filename: entry.filename,
        blobName: entry.blobName,
        uploadUrl: entry.uploadUrl,
        contentType: entry.contentType || files[index]?.type || 'application/octet-stream',
        size: files[index]?.size ?? entry.size ?? 0,
      }))

      if (uploads.length !== files.length) {
        throw new Error('Upload URL count does not match the selected files')
      }

      appendLog('Secure upload links generated.', 'info')

      setStage('uploading_documents')
      setStatusMessage(stageLabels.uploading_documents)

      for (let i = 0; i < files.length; i += 1) {
        const file = files[i]
        const uploadInfo = uploads[i]
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }))

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.open('PUT', uploadInfo.uploadUrl)
          xhr.setRequestHeader('x-ms-blob-type', 'BlockBlob')
          xhr.setRequestHeader('Content-Type', uploadInfo.contentType)

          xhr.upload.onprogress = (event) => {
            if (!event.lengthComputable) return
            const percent = Math.round((event.loaded * 100) / event.total)
            setUploadProgress((prev) => ({ ...prev, [file.name]: percent }))
          }

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }))
              appendLog(`Uploaded ${file.name}`, 'success')
              resolve()
            } else {
              reject(new Error(`Upload failed for ${file.name} (${xhr.status})`))
            }
          }

          xhr.onerror = () => {
            reject(new Error(`Network error while uploading ${file.name}`))
          }

          xhr.send(file)
        })
      }

      if (!isMounted.current) return

      setStage('registering_documents')
      setStatusMessage(stageLabels.registering_documents)

      const completeRes = await fetch(`/api/v1/projects/${createdProjectId}/uploads/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: uploads.map((entry) => ({
            fileName: entry.filename,
            blobName: entry.blobName,
            contentType: entry.contentType,
            size: entry.size,
          })),
        }),
      })

      if (!completeRes.ok && completeRes.status !== 207) {
        const message = (await completeRes.json().catch(() => ({}))).error || completeRes.statusText
        throw new Error(message || 'Failed to register uploaded documents')
      }

      const completeData = await completeRes.json().catch(() => ({}))
      const documentIds: string[] = Array.isArray(completeData?.documents)
        ? completeData.documents.map((doc: any) => doc.id).filter(Boolean)
        : []

      appendLog('Documents registered successfully.', 'success')

      setStage('triggering_orchestrator')
      setStatusMessage(stageLabels.triggering_orchestrator)

      const orchestratorRes = await fetch(`/api/v1/projects/${createdProjectId}/processing/orchestrator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentIds }),
      })

      if (!orchestratorRes.ok) {
        const message = (await orchestratorRes.json().catch(() => ({}))).error || orchestratorRes.statusText
        throw new Error(message || 'Failed to trigger orchestrator')
      }

      const orchestratorData = await orchestratorRes.json()
      const run = orchestratorData?.run
      const runUidValue = run?.run_uid || run?.runUid || run?.runUid

      if (!runUidValue) {
        throw new Error('Orchestrator response missing run identifier')
      }

      appendLog('Orchestrator run started.', 'info')

      if (!isMounted.current) return

      setRunUid(runUidValue)
      setStage('processing')
      setStatusMessage(stageLabels.processing)
      startStream(createdProjectId, runUidValue)
    } catch (error: any) {
      console.error('New project flow failed:', error)
      appendLog(error?.message || 'An unexpected error occurred.', 'error')
      setErrorMessage(error?.message || 'An unexpected error occurred.')
      setStage('error')
    }
  }

  const isBusy = ['creating_project', 'getting_upload_urls', 'uploading_documents', 'registering_documents', 'triggering_orchestrator', 'processing'].includes(stage)

  return (
    <div className="container mx-auto max-w-4xl space-y-6 py-6">
      <Card>
        <CardHeader>
          <CardTitle>New Project Upload</CardTitle>
          <CardDescription>
            {userName ? `Hi ${userName.split(' ')[0]}, ` : ''}upload key project documents and let the AI orchestrator configure the project workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="working-title">Working title (used until AI extracts the official project name)</Label>
            <Input
              id="working-title"
              value={workingTitle}
              onChange={(event) => setWorkingTitle(event.target.value)}
              placeholder="e.g., Bid - Northbridge Wharf"
              disabled={isBusy}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-files">Project documents</Label>
            <label
              htmlFor="project-files"
              className={`flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded border border-dashed p-6 text-center transition-colors ${
                isBusy ? 'bg-muted text-muted-foreground' : 'hover:border-primary hover:bg-muted'
              }`}
            >
              <UploadCloud className="mb-3 h-8 w-8 text-primary" />
              <p className="text-sm font-medium text-foreground">Drop files here or click to browse</p>
              <p className="text-xs text-muted-foreground">PDF, DOCX, XLSX and other formats up to 100&nbsp;MB each</p>
              <input
                id="project-files"
                type="file"
                multiple
                className="hidden"
                disabled={isBusy}
                onChange={(event) => handleFilesSelected(event.target.files)}
              />
            </label>

            {files.length > 0 && (
              <div className="space-y-2 rounded border p-3">
                <p className="text-sm font-medium text-foreground">Selected files</p>
                <ul className="space-y-2 text-sm">
                  {files.map((file) => (
                    <li key={file.name} className="flex items-center justify-between gap-3">
                      <div className="flex-1 truncate">
                        <p className="truncate font-medium text-foreground">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                      {stage === 'uploading_documents' || uploadProgress[file.name] ? (
                        <div className="flex w-32 items-center gap-2">
                          <Progress value={uploadProgress[file.name] ?? 0} className="h-2 flex-1" />
                          <span className="text-xs text-muted-foreground">{uploadProgress[file.name] ?? 0}%</span>
                        </div>
                      ) : (
                        !isBusy && (
                          <Button variant="ghost" size="icon" onClick={() => removeFile(file.name)}>
                            <X className="h-4 w-4" />
                          </Button>
                        )
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleStart} disabled={isBusy || files.length === 0}>
              {isBusy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Working...
                </>
              ) : (
                'Start AI Project'
              )}
            </Button>
            {stage === 'error' && (
              <Button variant="outline" onClick={reset}>
                Reset
              </Button>
            )}
            {stage === 'completed' && projectId && (
              <Button variant="secondary" onClick={() => router.push(`/projects/${projectId}/overview`)}>
                View Project
              </Button>
            )}
          </div>

          <div className="rounded border bg-muted/40 p-4 text-sm">
            <p className="font-medium text-foreground">Status</p>
            <p className="text-muted-foreground">{statusMessage}</p>
            {projectId && (
              <p className="mt-1 text-xs text-muted-foreground">Project ID: {projectId}</p>
            )}
            {runUid && (
              <p className="text-xs text-muted-foreground">Processing run: {runUid}</p>
            )}
          </div>

          {errorMessage && (
            <div className="flex items-start gap-2 rounded border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4" />
              <span>{errorMessage}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity log</CardTitle>
          <CardDescription>Recent steps from the upload and orchestrator run.</CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {logs.map((log) => (
                <li key={log.id} className="flex items-start gap-2">
                  {log.level === 'success' && <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />}
                  {log.level === 'warning' && <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-500" />}
                  {log.level === 'error' && <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />}
                  {log.level === 'info' && <Loader2 className="mt-0.5 h-4 w-4 text-muted-foreground" />}
                  <div>
                    <p className="font-medium text-foreground">{log.message}</p>
                    <p className="text-xs text-muted-foreground">{log.timestamp}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
