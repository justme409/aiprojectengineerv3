"use client"
import { useState, useRef } from 'react'

interface DocumentUploadProps {
	projectId: string
}

export default function DocumentUpload({ projectId }: DocumentUploadProps) {
	const [uploading, setUploading] = useState(false)
	const [progress, setProgress] = useState('')
	const fileInputRef = useRef<HTMLInputElement>(null)

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || [])
		if (files.length === 0) return

		setUploading(true)
		setProgress('Getting upload URLs...')

		try {
			// Get SAS URLs for files
			const response = await fetch(`/api/v1/projects/${projectId}/uploads/azure-sas`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					files: files.map(f => ({
						file_name: f.name,
						content_type: f.type,
						size: f.size
					}))
				})
			})

			if (!response.ok) throw new Error('Failed to get upload URLs')
			const { uploads } = await response.json()

			// Upload each file
			for (let i = 0; i < files.length; i++) {
				const file = files[i]
				const upload = uploads[i]
				setProgress(`Uploading ${file.name}...`)

				const uploadResponse = await fetch(upload.uploadUrl, {
					method: 'PUT',
					headers: {
						'Content-Type': file.type,
						'x-ms-blob-type': 'BlockBlob'
					},
					body: file
				})

				if (!uploadResponse.ok) throw new Error(`Upload failed for ${file.name}`)
			}

			setProgress('Notifying server...')
			// Notify server uploads are complete
			await fetch(`/api/v1/projects/${projectId}/uploads/complete`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ document_ids: uploads.map(u => u.id) })
			})

			setProgress('Upload complete!')
			if (fileInputRef.current) fileInputRef.current.value = ''

		} catch (error) {
			console.error('Upload failed:', error)
			setProgress('Upload failed')
		} finally {
			setUploading(false)
		}
	}

	return (
		<div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
			<div className="text-center">
				<div className="mb-4">
					<label className="cursor-pointer">
						<span className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
							{uploading ? 'Uploading...' : 'Select Files'}
						</span>
						<input
							ref={fileInputRef}
							type="file"
							multiple
							onChange={handleFileSelect}
							className="hidden"
							disabled={uploading}
						/>
					</label>
				</div>
				<p className="text-gray-500 text-sm">
					Upload project documents. Files will be processed by AI for content extraction.
				</p>
				{progress && (
					<p className="mt-2 text-sm text-blue-600">{progress}</p>
				)}
			</div>
		</div>
	)
}
