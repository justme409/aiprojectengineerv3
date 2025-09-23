import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getEnrichedProjectById } from '@/lib/actions/project-actions'
import { getAssets } from '@/lib/actions/asset-actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FileText,
  Map,
  Mail,
  Settings,
  ChevronRight
} from 'lucide-react'

interface PageProps {
	params: Promise<{ projectId: string }>
}

export default async function ProjectOverviewPage({ params }: PageProps) {
	const { projectId } = await params
	const enrichedProject = await getEnrichedProjectById(projectId)
	if (!enrichedProject) notFound()

	const project = enrichedProject
	const projectAsset = enrichedProject.projectAsset
	const jurisdiction = projectAsset?.content?.jurisdiction || 'unknown'

	const assets: any[] = await getAssets({ project_id: projectId, limit: 10 })

	// Jurisdiction-based feature flags
	const showPrimaryTesting = jurisdiction === 'NSW'
	const showJurisdictionSpecificContent = jurisdiction !== 'unknown'

	// Jurisdiction display logic
	const getJurisdictionDisplayName = (jurisdiction: string) => {
		switch (jurisdiction.toLowerCase()) {
			case 'nsw': return 'New South Wales'
			case 'qld': return 'Queensland'
			case 'vic': return 'Victoria'
			case 'sa': return 'South Australia'
			case 'wa': return 'Western Australia'
			case 'tas': return 'Tasmania'
			case 'nt': return 'Northern Territory'
			case 'act': return 'Australian Capital Territory'
			default: return jurisdiction.toUpperCase()
		}
	}

	return (
		<div className="space-y-8">
			{/* Project Header */}
			<div className="bg-card rounded-lg border shadow-sm p-6">
				<div className="flex justify-between items-start">
					<div>
						<h1 className="text-3xl font-bold text-card-foreground">{enrichedProject.displayName}</h1>
						<p className="text-muted-foreground mt-2">{projectAsset?.content?.description || project.description}</p>
					</div>
					<div className="text-sm text-muted-foreground">
						<strong>Jurisdiction:</strong> {getJurisdictionDisplayName(jurisdiction)}
					</div>
				</div>
				<div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
					<div><strong>Client:</strong> {enrichedProject.displayClient}</div>
					<div><strong>Location:</strong> {projectAsset?.content?.project_address || projectAsset?.content?.location || project.location}</div>
					<div><strong>State/Territory:</strong> {projectAsset?.content?.state_territory}</div>
                    <div><strong>Local Council:</strong> {projectAsset?.content?.local_council}</div>
                    {/* <div><strong>Regulatory Framework:</strong> {projectAsset?.content?.regulatory_framework}</div> */}
                    {/* Project details link moved to Documents section */}
				</div>
			</div>

			{/* Main Navigation Sections */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

				{/* Project Controls */}
				<Card>
					<CardHeader>
						<CardTitle>Project Controls</CardTitle>
						<CardDescription>Plans, schedule, and structure</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<Link href={`/projects/${projectId}/plans`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileText className="mr-2 h-4 w-4" />
								Management Plans
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/projects/${projectId}/wbs`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileText className="mr-2 h-4 w-4" />
								Schedule & WBS
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
					</CardContent>
				</Card>

				{/* Documents (only item left from original core) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Documents</CardTitle>
                        <CardDescription>All project documentation</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Link href={`/projects/${projectId}/documents`}>
                            <Button variant="ghost" className="w-full justify-start">
                                <FileText className="mr-2 h-4 w-4" />
                                Documents
                                <ChevronRight className="ml-auto h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href={`/projects/${projectId}/settings`}>
                            <Button variant="ghost" className="w-full justify-start">
                                <FileText className="mr-2 h-4 w-4" />
                                Project Details
                                <ChevronRight className="ml-auto h-4 w-4" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

				{/* Quality */}
				<Card>
					<CardHeader>
						<CardTitle>Quality</CardTitle>
						<CardDescription>Quality assurance and control</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<Link href={`/projects/${projectId}/quality/itp-templates`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileText className="mr-2 h-4 w-4" />
								ITP Templates
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/projects/${projectId}/quality/itp-register`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileText className="mr-2 h-4 w-4" />
								ITP Register
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/projects/${projectId}/inspections`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileText className="mr-2 h-4 w-4" />
								Inspections
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/projects/${projectId}/materials`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileText className="mr-2 h-4 w-4" />
								Materials
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
                        {/* Tests temporarily removed */}
						{showPrimaryTesting && (
							<Link href={`/projects/${projectId}/quality/primary-testing`}>
								<Button variant="ghost" className="w-full justify-start">
									<FileText className="mr-2 h-4 w-4" />
									Primary Testing (NSW)
									<ChevronRight className="ml-auto h-4 w-4" />
								</Button>
							</Link>
						)}
					</CardContent>
				</Card>

				{/* Health, Safety & Environment */}
				<Card>
					<CardHeader>
						<CardTitle>Health, Safety & Environment</CardTitle>
						<CardDescription>HSE management and compliance</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<Link href={`/projects/${projectId}/hse/swms`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileText className="mr-2 h-4 w-4" />
								SWMS
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/projects/${projectId}/hse/permits`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileText className="mr-2 h-4 w-4" />
								Permits
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/projects/${projectId}/hse/toolbox-talks`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileText className="mr-2 h-4 w-4" />
								Toolbox Talks
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/projects/${projectId}/hse/safety-walks`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileText className="mr-2 h-4 w-4" />
								Safety Walks
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/projects/${projectId}/hse/inductions`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileText className="mr-2 h-4 w-4" />
								Inductions
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/projects/${projectId}/hse/incidents`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileText className="mr-2 h-4 w-4" />
								Incidents
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						{/* <Link href={`/projects/${projectId}/hse/capa`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileText className="mr-2 h-4 w-4" />
								CAPA
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link> */}
					</CardContent>
				</Card>

				{/* Site (formerly Field Operations) */}
				<Card>
					<CardHeader>
						<CardTitle>Site</CardTitle>
						<CardDescription>Site operations and daily activities</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<Link href={`/projects/${projectId}/field/daily-diaries`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileText className="mr-2 h-4 w-4" />
								Daily Diaries
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/projects/${projectId}/field/site-instructions`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileText className="mr-2 h-4 w-4" />
								Site Instructions
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/projects/${projectId}/field/photos`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileText className="mr-2 h-4 w-4" />
								Photos
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
					</CardContent>
				</Card>

				{/* Approvals & Communication */}
				<Card>
					<CardHeader>
						<CardTitle>Approvals & Communication</CardTitle>
						<CardDescription>Workflow approvals and communication</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<Link href={`/projects/${projectId}/approvals/designer`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileText className="mr-2 h-4 w-4" />
								Approvals Designer
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/projects/${projectId}/approvals/inbox`}>
							<Button variant="ghost" className="w-full justify-start">
								<Mail className="mr-2 h-4 w-4" />
								Approvals Inbox
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/projects/${projectId}/inbox`}>
							<Button variant="ghost" className="w-full justify-start">
								<Mail className="mr-2 h-4 w-4" />
								Project Inbox
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
					</CardContent>
				</Card>

				{/* Tools & Analytics */}
				<Card>
					<CardHeader>
						<CardTitle>Tools & Analytics</CardTitle>
						<CardDescription>Maps, reports, and project tools</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<Link href={`/projects/${projectId}/map`}>
							<Button variant="ghost" className="w-full justify-start">
								<Map className="mr-2 h-4 w-4" />
								Map View
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/projects/${projectId}/reports`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileText className="mr-2 h-4 w-4" />
								Reports
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/projects/${projectId}/settings`}>
							<Button variant="ghost" className="w-full justify-start">
								<Settings className="mr-2 h-4 w-4" />
								Settings
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
