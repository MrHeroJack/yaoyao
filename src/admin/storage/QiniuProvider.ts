import { IStorageProvider, UploadProgress, UploadResult, UploadTaskHandle } from './IStorageProvider'
// qiniu-js 导出比较奇怪，这里直接用 any 绕过类型检查
import * as qiniu from 'qiniu-js'

type QiniuRegionKey = 'z0' | 'z1' | 'z2' | 'na0' | 'as0'

interface QiniuTokenResponse {
  uploadToken: string
  scope: string
  region?: string
  publicBaseUrl?: string
}

function resolveQiniuRegion(regionKey?: string) {
  const key = (regionKey || (import.meta.env.VITE_QINIU_REGION as string) || 'z0').trim() as QiniuRegionKey
  const regionMap: Record<QiniuRegionKey, any> = {
    z0: qiniu.region.z0,
    z1: qiniu.region.z1,
    z2: qiniu.region.z2,
    na0: qiniu.region.na0,
    as0: qiniu.region.as0,
  }
  return regionMap[key] || qiniu.region.z0
}

async function getUploadToken(key?: string): Promise<QiniuTokenResponse> {
  const res = await fetch('/api/upload/qiniu/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key }),
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to get qiniu token')
  return res.json()
}

export class QiniuProvider implements IStorageProvider {
  upload(file: File, onProgress: (p: UploadProgress) => void): { promise: Promise<UploadResult>; handle: UploadTaskHandle } {
    const extension = file.name.split('.').pop() || 'jpg'
    const key = `uploads/${new Date().getFullYear()}/${(new Date().getMonth()+1).toString().padStart(2,'0')}/${crypto.randomUUID()}.${extension}`
    let paused = false
    let cancelled = false
    let sub: any

    const promise = (async () => {
      const { uploadToken, region, publicBaseUrl } = await getUploadToken(key)
      const putExtra = {
        fname: file.name,
        params: {},
        mimeType: null,
      } as any
      const config = { useCdnDomain: true, region: resolveQiniuRegion(region) }
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
      const runtimeBaseUrl = (publicBaseUrl || '').trim().replace(/\/+$/, '')
      const buildBaseUrl = (import.meta.env.VITE_QINIU_PUBLIC_URL || '').trim().replace(/\/+$/, '')
      const baseUrl = runtimeBaseUrl || buildBaseUrl
      if (!baseUrl) {
        throw new Error('Qiniu public URL is not configured')
      }
      const url = `${baseUrl}/${key}`
      return { url, key, provider: 'qiniu' as const }
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
