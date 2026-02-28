import { IStorageProvider, UploadProgress, UploadResult, UploadTaskHandle } from './IStorageProvider'

async function getPolicy(dir?: string): Promise<{ accessKeyId: string; policy: string; signature: string; host: string; dir: string }> {
  const res = await fetch('/api/upload/oss/policy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dir }),
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to get oss policy')
  return res.json()
}

export class OSSProvider implements IStorageProvider {
  upload(file: File, onProgress: (p: UploadProgress) => void): { promise: Promise<UploadResult>; handle: UploadTaskHandle } {
    const extension = file.name.split('.').pop() || 'jpg'
    const key = `uploads/${new Date().getFullYear()}/${(new Date().getMonth()+1).toString().padStart(2,'0')}/${crypto.randomUUID()}.${extension}`
    let xhr: XMLHttpRequest | null = null
    let cancelled = false

    const promise = (async () => {
      const { accessKeyId, policy, signature, host } = await getPolicy('uploads/')

      await new Promise<void>((resolve, reject) => {
        xhr = new XMLHttpRequest()
        xhr.open('POST', host, true)
        xhr.upload.onprogress = (event) => {
          if (!event.lengthComputable) return
          const percent = Math.round((event.loaded / event.total) * 100)
          onProgress({ loaded: event.loaded, total: event.total, percent })
        }
        xhr.onerror = () => reject(new Error('OSS upload failed'))
        xhr.onabort = () => {
          reject(new Error(cancelled ? 'Upload cancelled' : 'Upload aborted'))
        }
        xhr.onload = () => {
          if (xhr && xhr.status >= 200 && xhr.status < 300) {
            onProgress({ loaded: file.size, total: file.size, percent: 100 })
            resolve()
            return
          }
          reject(new Error(`OSS upload failed with status ${xhr?.status || 'unknown'}`))
        }

        const formData = new FormData()
        formData.append('key', key)
        formData.append('policy', policy)
        formData.append('OSSAccessKeyId', accessKeyId)
        formData.append('Signature', signature)
        formData.append('success_action_status', '200')
        formData.append('file', file)

        xhr.send(formData)
      })
      const url = `${host}/${key}`
      return { url, key, provider: 'oss' as const }
    })()

    const handle: UploadTaskHandle = {
      pause: () => {
        // OSS 表单上传不支持原生断点续传，保留接口兼容性。
      },
      resume: () => {
        // OSS 表单上传不支持原生断点续传，保留接口兼容性。
      },
      cancel: () => {
        cancelled = true
        xhr?.abort()
      },
    }

    return { promise, handle }
  }
}
