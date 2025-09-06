'use client'

import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'

const ApprovalsInbox = dynamic(() => import('@/components/features/approvals/ApprovalsInbox'), { ssr: false })

export default function Page() {
	const params = useParams()
	const projectId = params.projectId as string
	// In a real app, userId comes from session; for now, load via API on server and inject, or fetch server-side. Here we assume next-auth session supplies it client-side alternatively via an endpoint.
	const userId = ''
	return <ApprovalsInbox projectId={projectId} />
}


