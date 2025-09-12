import { query } from '@/lib/db'

export async function createProject(input: { id?: string, name: string, description?: string, location?: string, client_name?: string, created_by_user_id?: string, status?: string, organization_id: string, settings?: any }) {
	const id = input.id || crypto.randomUUID()
	await query(
		`INSERT INTO public.projects (id, name, description, location, client_name, created_by_user_id, status, organization_id, settings)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
		[id, input.name, input.description ?? null, input.location ?? null, input.client_name ?? null, input.created_by_user_id ?? null, input.status ?? 'draft', input.organization_id, input.settings ?? {}]
	)
	return { id }
}

export async function updateProject(id: string, updates: Partial<{ name: string, description: string, location: string, client_name: string, status: string, settings: any }>) {
	const fields: string[] = []
	const params: any[] = []
	let i = 1
	for (const [k, v] of Object.entries(updates)) {
		fields.push(`${k} = $${i++}`)
		params.push(v)
	}
	params.push(id)
	if (fields.length === 0) return { id }
	await query(`UPDATE public.projects SET ${fields.join(', ')}, updated_at=now() WHERE id=$${i}`, params)
	return { id }
}

export async function deleteProject(id: string) {
	await query('DELETE FROM public.projects WHERE id=$1', [id])
	return { id }
}

export async function getProjects() {
	const { rows } = await query('SELECT * FROM public.projects ORDER BY created_at DESC')
	return rows
}

export async function getProjectById(id: string) {
	const { rows } = await query('SELECT * FROM public.projects WHERE id=$1', [id])
	return rows[0] || null
}

export async function getEnrichedProjectById(id: string) {
	const project = await getProjectById(id)
	if (!project) return null

	// Import getAssets here to avoid circular dependency
	const { getAssets } = await import('./asset-actions')

	const assets = await getAssets({ project_id: id, type: 'project', limit: 1 })
	const projectAsset = assets.find(asset => asset.type === 'project')

	return {
		...project,
		projectAsset: projectAsset ? {
			...projectAsset,
			content: projectAsset.content || {}
		} : undefined,
		displayName: projectAsset?.name || project.name || `Project ${project.id.slice(0, 8)}`,
		displayClient: projectAsset?.content?.client || projectAsset?.content?.client_name || project.client_name || 'Client unknown'
	}
}

export async function getEnrichedProjects() {
	const projects = await getProjects()
	if (!projects.length) return []

	// Import getAssets here to avoid circular dependency
	const { getAssets } = await import('./asset-actions')

	// Get all project assets in one query
	const projectAssets = await getAssets({ type: 'project' })

	// Create a map for quick lookup
	const assetMap = new Map()
	projectAssets.forEach(asset => {
		assetMap.set(asset.project_id, asset)
	})

	// Enrich each project with its asset data
	return projects.map(project => {
		const projectAsset = assetMap.get(project.id)
		return {
			...project,
			projectAsset: projectAsset ? {
				...projectAsset,
				content: projectAsset.content || {}
			} : undefined,
			displayName: projectAsset?.name || project.name || `Project ${project.id.slice(0, 8)}`,
			displayClient: projectAsset?.content?.client || projectAsset?.content?.client_name || project.client_name || 'Client unknown'
		}
	})
}
