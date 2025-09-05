'use client'

import { useParams } from 'next/navigation'
import LbsView from '@/components/features/lbs/LbsView'

export default function LbsPage() {
	const params = useParams()
	const projectId = params.projectId as string

	return <LbsView projectId={projectId} />
}
