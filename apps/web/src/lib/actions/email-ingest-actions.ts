import { query } from '@/lib/db'
import { upsertAssetsAndEdges } from '@/lib/actions/graph-repo'

export async function parseEmail(rawMime: string, projectId: string) {
	// In a real implementation, this would parse MIME email format
	// For now, we'll simulate email parsing
	const parsed = {
		message_id: `msg_${Date.now()}@${projectId}.com`,
		in_reply_to: null,
		subject: "Sample Email Subject",
		from: "sender@example.com",
		to: ["recipient@project.com"],
		body: "Sample email body content",
		attachments: [],
		timestamp: new Date().toISOString()
	}

	return parsed
}

export async function threadCorrespondence(projectId: string, messageId: string, inReplyTo?: string) {
	// Find or create thread
	let threadKey: string
	let threadId: string

	if (inReplyTo) {
		// Find existing thread
		const existingThread = await query(`
			SELECT ct.id, ct.thread_key
			FROM public.correspondence_threads ct
			JOIN public.assets a ON a.id = ct.asset_id
			WHERE a.content->>'message_id' = $1 AND ct.project_id = $2
		`, [inReplyTo, projectId])

		if (existingThread.rows.length > 0) {
			threadKey = existingThread.rows[0].thread_key
			threadId = existingThread.rows[0].id
		} else {
			// Create new thread
			const threadResult = await query(`
				INSERT INTO public.correspondence_threads (project_id, thread_key, last_message_at, participants)
				VALUES ($1, $2, NOW(), $3)
				RETURNING id
			`, [projectId, `thread_${Date.now()}`, []])
			threadKey = `thread_${Date.now()}`
			threadId = threadResult.rows[0].id
		}
	} else {
		// Create new thread
		const threadResult = await query(`
			INSERT INTO public.correspondence_threads (project_id, thread_key, last_message_at, participants)
			VALUES ($1, $2, NOW(), $3)
			RETURNING id
		`, [projectId, `thread_${Date.now()}`, []])
		threadKey = `thread_${Date.now()}`
		threadId = threadResult.rows[0].id
	}

	// Update thread with latest message
	await query(`
		UPDATE public.correspondence_threads
		SET last_message_at = NOW()
		WHERE id = $1
	`, [threadId])

	return { threadKey, threadId }
}

export async function ingestRawEmail(rawMime: string, projectId: string) {
	// Parse the email
	const parsedEmail = await parseEmail(rawMime, projectId)

	// Create correspondence asset
	const spec = {
		asset: {
			type: 'correspondence',
			name: parsedEmail.subject,
			project_id: projectId,
			content: parsedEmail
		},
		idempotency_key: `email:${projectId}:${parsedEmail.message_id}`
	}

	const result = await upsertAssetsAndEdges(spec)

	// Handle threading
	const threadInfo = await threadCorrespondence(projectId, parsedEmail.message_id, parsedEmail.in_reply_to)

	// Update the correspondence asset with thread info
	await upsertAssetsAndEdges({
		asset: {
			id: result.id,
			content: {
				...parsedEmail,
				thread_key: threadInfo.threadKey
			}
		},
		idempotency_key: `update_thread:${result.id}`
	})

	// Update correspondence_threads with asset reference
	await query(`
		UPDATE public.correspondence_threads
		SET asset_id = $1
		WHERE id = $2
	`, [result.id, threadInfo.threadId])

	return {
		correspondence_asset_id: result.id,
		message_id: parsedEmail.message_id,
		thread_key: threadInfo.threadKey,
		subject: parsedEmail.subject
	}
}

export async function getCorrespondenceThreads(projectId: string) {
	const { rows } = await query(`
		SELECT
			ct.*,
			a.name as latest_subject,
			a.content->>'from' as latest_from,
			a.created_at as latest_date
		FROM public.correspondence_threads ct
		LEFT JOIN public.assets a ON a.id = ct.asset_id
		WHERE ct.project_id = $1
		ORDER BY ct.last_message_at DESC
	`, [projectId])

	return rows
}

export async function getThreadMessages(threadKey: string, projectId: string) {
	const { rows } = await query(`
		SELECT a.*
		FROM public.assets a
		JOIN public.correspondence_threads ct ON ct.asset_id = a.id
		WHERE ct.thread_key = $1 AND ct.project_id = $2
		UNION ALL
		SELECT a.*
		FROM public.assets a
		WHERE a.content->>'thread_key' = $1 AND a.project_id = $2
		ORDER BY a.created_at ASC
	`, [threadKey, projectId])

	return rows
}

export async function linkEmailToAssets(emailAssetId: string, referencedAssetIds: string[]) {
	const edges = referencedAssetIds.map(assetId => ({
		from_asset_id: emailAssetId,
		to_asset_id: assetId,
		edge_type: 'REFERENCES' as const,
		properties: { reference_type: 'email_mention' }
	}))

	return upsertAssetsAndEdges({
		asset: { id: emailAssetId },
		edges,
		idempotency_key: `link_email:${emailAssetId}`
	})
}
