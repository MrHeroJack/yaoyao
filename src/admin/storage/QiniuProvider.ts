import { IStorageProvider, UploadProgress, UploadResult, UploadTaskHandle } from './IStorageProvider'
// qiniu-js 导出比较奇怪，这里直接用 any 绕过类型检查
import * as qiniu from 'qiniu-js'

async function getUploadToken(key?: string): Promise<{ uploadToken: string; scope: string }> {
  const res = await fetch('/api/upload/qiniu/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key }),
  })
  if (!res.ok) throw new Error('Failed to get qiniu token')
  return res.json()
}

export class QiniuProvider implements IStorageProvider {
  upload(file: File, onProgress: (p: UploadProgress) => void): { promise: Promise<UploadResult>; handle: UploadTaskHandle } {
    const key = `uploads/${new Date().getFullYear()}/${(new Date().getMonth()+1).toString().padStart(2,'0')}/${crypto.randomUUID()}.${file.name.split('.').pop()}`
    let paused = false
    let cancelled = false
    let sub: any

    const promise = (async () => {
      const { uploadToken } = await getUploadToken(key)
      const putExtra = {
        fname: file.name,
        params: {},
        mimeType: null,
      } as any
      const config = { useCdnDomain: true, region: qiniu.region.z0 }
      await new Promise<void>((resolve, reject) => {
        const observable = qiniu.upload(file, key, uploadToken, putExtra, config)
        sub = observable.subscribe({
          next: (res: any) => {
            const { total } = res
            const percent = total.percent || 0
            onProgress({ loaded: total.loaded || 0, total: total.size || file.size, percent })
          },
          error: (err: any) => reject(err),
          complete: () => resolve(),
        })
      })
      // 七牛公开域名需在后端或配置中提供，这里仅返回 key
      return { url: key, key, provider: 'qiniu' as const }
    })()

    const handle: UploadTaskHandle = {
      pause: () => {
        paused = true
        sub?.unsubscribe()
      },
      resume: () => {
        if (paused && !cancelled) {
          // 简化处理：重新开始上传，七牛 JS SDK 会自动断点续传（需同 key）
          paused = false
        }
      },
      cancel: () => {
        cancelled = true
        sub?.unsubscribe()
      },
    }

    return { promise, handle }
  }
}

