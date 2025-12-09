import { useMemo, useRef, useState } from 'react'
import { getProvider } from '../storage/providerFactory'
import { UPLOAD_ALLOWED_TYPES, UPLOAD_MAX_SIZE } from '../../config/storage'
import type { UploadProgress, UploadResult } from '../storage/IStorageProvider'

interface ImageUploaderProps {
  onCompleted: (results: UploadResult[]) => void
}

export default function ImageUploader({ onCompleted }: ImageUploaderProps) {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [progresses, setProgresses] = useState<Record<number, UploadProgress>>({})
  const provider = useMemo(() => getProvider(), [])
  const inputRef = useRef<HTMLInputElement | null>(null)

  const validateFiles = (list: FileList) => {
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
    const results: UploadResult[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const res = await provider.upload(file, (p) => {
        setProgresses((prev) => ({ ...prev, [i]: p }))
      }) as UploadResult
      results.push(res)
    }
    onCompleted(results)
    setFiles([])
    setPreviews([])
    setProgresses({})
    inputRef.current?.value && (inputRef.current.value = '')
  }

  return (
    <div className="image-uploader">
      <div className="uploader-inputs">
        <input ref={inputRef} type="file" accept="image/*" multiple onChange={onSelect} />
        <button className="submit-button" onClick={startUpload} disabled={!files.length}>开始上传</button>
      </div>
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

