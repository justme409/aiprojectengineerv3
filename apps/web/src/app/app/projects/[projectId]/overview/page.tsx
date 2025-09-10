import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProjectById } from '@/lib/actions/project-actions'
import { getAssets } from '@/lib/actions/asset-actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FileText,
  FolderOpen,
  Map,
  CheckSquare,
  Truck,
  TestTube,
  HardHat,
  Wrench,
  FileCheck,
  Mail,
  BarChart3,
  Settings,
  Shield,
  ChevronRight,
  Home,
  Users
} from 'lucide-react'

interface PageProps {
	params: Promise<{ projectId: string }>
}

export default async function ProjectOverviewPage({ params }: PageProps) {
	const { projectId } = await params
	const project = await getProjectById(projectId)
	if (!project) notFound()

	const assets = await getAssets({ project_id: projectId, limit: 10 })

	// Get project asset for dynamic fields
	const projectAsset = assets.find(asset => asset.type === 'project')
	const jurisdiction = projectAsset?.content?.jurisdiction || 'unknown'

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
			<div className="bg-white rounded-lg shadow-sm border p-6">
				<div className="flex justify-between items-start">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">{projectAsset?.name || project.name}</h1>
						<p className="text-gray-600 mt-2">{projectAsset?.content?.description || project.description}</p>
					</div>
					<div className="text-sm text-gray-500">
						<strong>Jurisdiction:</strong> {getJurisdictionDisplayName(jurisdiction)}
					</div>
				</div>
				<div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
					<div><strong>Client:</strong> {projectAsset?.content?.client || projectAsset?.content?.client_name || project.clientName}</div>
					<div><strong>Location:</strong> {projectAsset?.content?.project_address || projectAsset?.content?.location || project.location}</div>
					<div><strong>State/Territory:</strong> {projectAsset?.content?.state_territory}</div>
					<div><strong>Local Council:</strong> {projectAsset?.content?.local_council}</div>
					<div><strong>Regulatory Framework:</strong> {projectAsset?.content?.regulatory_framework}</div>
					{projectAsset?.content?.html && (
						<div><Link href={`/app/projects/${projectId}/details`} className="text-blue-600 hover:underline">View Details</Link></div>
					)}
				</div>
			</div>

			{/* Main Navigation Sections */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

				{/* Core Project Sections */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center">
							<FolderOpen className="mr-2 h-5 w-5" />
							Core Project
						</CardTitle>
						<CardDescription>Main project management areas</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<Link href={`/app/projects/${projectId}/documents`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileText className="mr-2 h-4 w-4" />
								Documents
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/app/projects/${projectId}/wbs`}>
							<Button variant="ghost" className="w-full justify-start">
								<FolderOpen className="mr-2 h-4 w-4" />
								Work Breakdown Structure
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/app/projects/${projectId}/lbs`}>
							<Button variant="ghost" className="w-full justify-start">
								<Map className="mr-2 h-4 w-4" />
								Location Breakdown Structure
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/app/projects/${projectId}/inspections`}>
							<Button variant="ghost" className="w-full justify-start">
								<CheckSquare className="mr-2 h-4 w-4" />
								Inspections
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/app/projects/${projectId}/materials`}>
							<Button variant="ghost" className="w-full justify-start">
								<Truck className="mr-2 h-4 w-4" />
								Materials
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/app/projects/${projectId}/tests`}>
							<Button variant="ghost" className="w-full justify-start">
								<TestTube className="mr-2 h-4 w-4" />
								Tests
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
					</CardContent>
				</Card>

				{/* Quality Management */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center">
							<Shield className="mr-2 h-5 w-5 text-blue-600" />
							Quality Management
						</CardTitle>
						<CardDescription>Quality assurance and control</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<Link href={`/app/projects/${projectId}/quality/itp-templates`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileText className="mr-2 h-4 w-4" />
								ITP Templates
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/app/projects/${projectId}/quality/itp`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileCheck className="mr-2 h-4 w-4" />
								ITP Documents
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/app/projects/${projectId}/quality/lots`}>
							<Button variant="ghost" className="w-full justify-start">
								<CheckSquare className="mr-2 h-4 w-4" />
								Lots
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/app/projects/${projectId}/quality/hold-witness`}>
							<Button variant="ghost" className="w-full justify-start">
								<CheckSquare className="mr-2 h-4 w-4" />
								Hold & Witness
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/app/projects/${projectId}/quality/itp-register`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileCheck className="mr-2 h-4 w-4" />
								ITP Register
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/app/projects/${projectId}/quality/records`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileText className="mr-2 h-4 w-4" />
								Records
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						{showPrimaryTesting && (
							<Link href={`/app/projects/${projectId}/quality/primary-testing`}>
								<Button variant="ghost" className="w-full justify-start">
									<TestTube className="mr-2 h-4 w-4" />
									Primary Testing (NSW)
									<ChevronRight className="ml-auto h-4 w-4" />
								</Button>
							</Link>
						)}
					</CardContent>
				</Card>

				{/* HSE Management */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center">
							<HardHat className="mr-2 h-5 w-5 text-red-600" />
							Health, Safety & Environment
						</CardTitle>
						<CardDescription>HSE management and compliance</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<Link href={`/app/projects/${projectId}/hse/swms`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileText className="mr-2 h-4 w-4" />
								SWMS
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/app/projects/${projectId}/hse/permits`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileCheck className="mr-2 h-4 w-4" />
								Permits
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/app/projects/${projectId}/hse/toolbox-talks`}>
							<Button variant="ghost" className="w-full justify-start">
								<HardHat className="mr-2 h-4 w-4" />
								Toolbox Talks
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/app/projects/${projectId}/hse/safety-walks`}>
							<Button variant="ghost" className="w-full justify-start">
								<HardHat className="mr-2 h-4 w-4" />
								Safety Walks
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/app/projects/${projectId}/hse/inductions`}>
							<Button variant="ghost" className="w-full justify-start">
								<HardHat className="mr-2 h-4 w-4" />
								Inductions
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/app/projects/${projectId}/hse/incidents`}>
							<Button variant="ghost" className="w-full justify-start">
								<HardHat className="mr-2 h-4 w-4" />
								Incidents
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/app/projects/${projectId}/hse/capa`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileCheck className="mr-2 h-4 w-4" />
								CAPA
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
					</CardContent>
				</Card>

				{/* Field Operations */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center">
							<Wrench className="mr-2 h-5 w-5 text-yellow-600" />
							Field Operations
						</CardTitle>
						<CardDescription>Site operations and daily activities</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<Link href={`/app/projects/${projectId}/field/daily-diaries`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileText className="mr-2 h-4 w-4" />
								Daily Diaries
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/app/projects/${projectId}/field/site-instructions`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileText className="mr-2 h-4 w-4" />
								Site Instructions
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/app/projects/${projectId}/field/timesheets`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileText className="mr-2 h-4 w-4" />
								Timesheets
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/app/projects/${projectId}/field/roster`}>
							<Button variant="ghost" className="w-full justify-start">
								<Users className="mr-2 h-4 w-4" />
								Roster
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/app/projects/${projectId}/field/plant`}>
							<Button variant="ghost" className="w-full justify-start">
								<Wrench className="mr-2 h-4 w-4" />
								Plant
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
					</CardContent>
				</Card>

				{/* Approvals & Communication */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center">
							<FileCheck className="mr-2 h-5 w-5 text-green-600" />
							Approvals & Communication
						</CardTitle>
						<CardDescription>Workflow approvals and communication</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<Link href={`/app/projects/${projectId}/approvals/designer`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileCheck className="mr-2 h-4 w-4" />
								Approvals Designer
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/app/projects/${projectId}/approvals/inbox`}>
							<Button variant="ghost" className="w-full justify-start">
								<Mail className="mr-2 h-4 w-4" />
								Approvals Inbox
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/app/projects/${projectId}/inbox`}>
							<Button variant="ghost" className="w-full justify-start">
								<Mail className="mr-2 h-4 w-4" />
								Project Inbox
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
					</CardContent>
				</Card>

				{/* Plans Management */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center">
							<FileText className="mr-2 h-5 w-5 text-indigo-600" />
							Plans Management
						</CardTitle>
						<CardDescription>Quality, safety, and management plans</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<Link href={`/app/projects/${projectId}/plans`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileText className="mr-2 h-4 w-4" />
								Management Plans
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
					</CardContent>
				</Card>

				{/* Tools & Analytics */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center">
							<BarChart3 className="mr-2 h-5 w-5 text-purple-600" />
							Tools & Analytics
						</CardTitle>
						<CardDescription>Maps, reports, and project tools</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<Link href={`/app/projects/${projectId}/map`}>
							<Button variant="ghost" className="w-full justify-start">
								<Map className="mr-2 h-4 w-4" />
								Map View
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/app/projects/${projectId}/reports`}>
							<Button variant="ghost" className="w-full justify-start">
								<BarChart3 className="mr-2 h-4 w-4" />
								Reports
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/app/projects/${projectId}/settings`}>
							<Button variant="ghost" className="w-full justify-start">
								<Settings className="mr-2 h-4 w-4" />
								Settings
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
					</CardContent>
				</Card>
			</div>

			{/* Recent Activity */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Activity</CardTitle>
					<CardDescription>Latest project updates and changes</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{assets.slice(0, 5).map((asset: any) => (
							<div key={asset.id} className="flex items-center justify-between p-4 border rounded-lg">
								<div className="flex items-center space-x-3">
									<div className="flex-shrink-0">
										<FileText className="h-5 w-5 text-gray-400" />
									</div>
									<div>
										<p className="text-sm font-medium text-gray-900">{asset.name}</p>
										<p className="text-sm text-gray-500">{asset.type}</p>
									</div>
								</div>
								<div className="text-sm text-gray-500">
									{new Date(asset.createdAt).toLocaleDateString()}
								</div>
							</div>
						))}
						{assets.length === 0 && (
							<p className="text-gray-500 text-center py-4">No recent activity</p>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
