import { useEffect, useRef, useState } from 'react'
import { getProvider } from '../storage/providerFactory'
import { UPLOAD_ALLOWED_TYPES, UPLOAD_MAX_SIZE } from '../../config/storage'
import type { IStorageProvider, UploadProgress, UploadResult } from '../storage/IStorageProvider'
import { resolveUploadResult } from '../storage/resolveUploadResult'

interface ImageUploaderProps {
  onCompleted: (results: UploadResult[]) => void
}

export default function ImageUploader({ onCompleted }: ImageUploaderProps) {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [progresses, setProgresses] = useState<Record<number, UploadProgress>>({})
  const [provider, setProvider] = useState<IStorageProvider | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    let active = true
    getProvider()
      .then((instance) => {
        if (active) setProvider(instance)
      })
      .catch((err) => {
        if (active) setErrorMessage((err as Error).message || '上传组件初始化失败')
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [previews])

  const validateFiles = (list: FileList) => {
    setErrorMessage('')
    const result: File[] = []
    const previewUrls: string[] = []
    Array.from(list).forEach((f) => {
      if (!UPLOAD_ALLOWED_TYPES.includes(f.type)) return
      if (f.size > UPLOAD_MAX_SIZE) return
      result.push(f)
      previewUrls.push(URL.createObjectURL(f))
    })
    setFiles(result)
    setPreviews(previewUrls)
  }

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    validateFiles(e.target.files)
  }

  const startUpload = async () => {
    if (!provider || isUploading) return
    setIsUploading(true)
    setErrorMessage('')
    const results: UploadResult[] = []
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const task = provider.upload(file, (p) => {
          setProgresses((prev) => ({ ...prev, [i]: p }))
        })
        const res = await resolveUploadResult(task)
        results.push(res)
      }
      onCompleted(results)
      setFiles([])
      setPreviews([])
      setProgresses({})
      if (inputRef.current) inputRef.current.value = ''
    } catch (err) {
      setErrorMessage((err as Error).message || '上传失败，请重试')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="image-uploader">
      <div className="uploader-inputs">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          aria-label="上传图片"
          onChange={onSelect}
        />
        <button className="submit-button" onClick={startUpload} disabled={!files.length || !provider || isUploading}>
          {isUploading ? '上传中...' : '开始上传'}
        </button>
      </div>
      {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}
      {!!previews.length && (
        <div className="image-preview-list">
          {previews.map((src, idx) => (
            <div key={idx} className="image-preview-item">
              <img src={src} alt={`预览${idx + 1}`} />
              <div className="progress-line">
                <div className="progress-fill" style={{ width: `${(progresses[idx]?.percent || 0)}%`, background: 'var(--highlight)' }}></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
