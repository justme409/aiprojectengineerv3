'use client'

import { useParams } from 'next/navigation'
import WbsView from '@/components/features/wbs/WbsView'

export default function WbsPage() {
	const params = useParams()
	const projectId = params.projectId as string

	return <WbsView projectId={projectId} />
}
