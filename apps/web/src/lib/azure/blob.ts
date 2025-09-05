import { BlobSASPermissions, SASProtocol, StorageSharedKeyCredential, generateBlobSASQueryParameters } from '@azure/storage-blob'

const account = process.env.AZURE_STORAGE_ACCOUNT
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY
const container = process.env.AZURE_CONTAINER

if (!account || !accountKey || !container) {
	console.warn('Azure Storage env vars missing; upload endpoints will fail until configured.')
}

export function generateBlobSasUrl(blobPath: string, expiresInMinutes = 30) {
	if (!account || !accountKey || !container) {
		throw new Error('Azure Storage not configured')
	}
	const credential = new StorageSharedKeyCredential(account, accountKey)
	const now = new Date()
	const expiry = new Date(now.getTime() + expiresInMinutes * 60 * 1000)
	const sas = generateBlobSASQueryParameters({
		protocol: SASProtocol.Https,
		containerName: container,
		blobName: blobPath,
		permissions: BlobSASPermissions.parse('cwr'),
		startsOn: now,
		expiresOn: expiry,
	}, credential).toString()
	const url = `https://${account}.blob.core.windows.net/${container}/${blobPath}?${sas}`
	return url
}
