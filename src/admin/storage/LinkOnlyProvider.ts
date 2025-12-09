import { IStorageProvider, UploadProgress, UploadResult } from './IStorageProvider'

export class LinkOnlyProvider implements IStorageProvider {
  async upload(file: File, onProgress: (p: UploadProgress) => void): Promise<UploadResult> {
    const url = URL.createObjectURL(file)
    onProgress({ loaded: file.size, total: file.size, percent: 100 })
    return { url, provider: 'link-only' }
  }
}

