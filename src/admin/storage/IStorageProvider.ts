export interface UploadProgress {
  loaded: number
  total: number
  percent: number
  speed?: number
  remainingSeconds?: number
}

export interface UploadResult {
  url: string
  key?: string
  provider?: 'qiniu' | 'oss' | 'link-only'
}

export interface UploadTaskHandle {
  pause: () => void
  resume: () => void
  cancel: () => void
}

export interface IStorageProvider {
  upload(file: File, onProgress: (p: UploadProgress) => void): Promise<UploadResult> | {
    promise: Promise<UploadResult>
    handle: UploadTaskHandle
  }
  list?(prefix?: string): Promise<{ url: string; key?: string }[]>
  remove?(key: string): Promise<void>
}

