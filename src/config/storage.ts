export type StorageProviderKey = 'link-only' | 'qiniu' | 'oss'

export const ACTIVE_PROVIDER: StorageProviderKey =
  (import.meta.env.VITE_STORAGE_PROVIDER as StorageProviderKey) || 'link-only'

export const UPLOAD_MAX_SIZE = (import.meta.env.VITE_UPLOAD_MAX_SIZE_MB || 5) * 1024 * 1024
export const UPLOAD_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif']

