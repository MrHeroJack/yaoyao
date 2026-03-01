export type StorageProviderKey = 'link-only' | 'qiniu' | 'oss'

function resolveStorageProvider(): StorageProviderKey {
  const raw = String(import.meta.env.VITE_STORAGE_PROVIDER || '').trim().toLowerCase()
  if (raw === 'qiniu' || raw === 'oss' || raw === 'link-only') {
    return raw
  }
  return 'link-only'
}

export const ACTIVE_PROVIDER: StorageProviderKey = resolveStorageProvider()

export const UPLOAD_MAX_SIZE = (import.meta.env.VITE_UPLOAD_MAX_SIZE_MB || 5) * 1024 * 1024
export const UPLOAD_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif']
