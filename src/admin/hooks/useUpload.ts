import { useCallback, useRef, useState } from 'react'
import { getProvider } from '../storage/providerFactory'
import type { UploadResult, UploadProgress } from '../storage/IStorageProvider'

export function useUpload(concurrency = 3) {
  const provider = getProvider()
  const [progress, setProgress] = useState<Record<string, UploadProgress>>({})
  const [results, setResults] = useState<UploadResult[]>([])
  const queueRef = useRef<File[]>([])
  const runningRef = useRef<number>(0)

  const push = useCallback((files: File[]) => {
    queueRef.current.push(...files)
    tick()
  }, [])

  const tick = useCallback(() => {
    while (runningRef.current < concurrency && queueRef.current.length) {
      const file = queueRef.current.shift()!
      runningRef.current += 1
      const id = `${file.name}-${file.size}-${file.lastModified}`
      Promise.resolve(provider.upload(file, (p) => setProgress((prev) => ({ ...prev, [id]: p }))) as any)
        .then((res: UploadResult) => setResults((prev) => [...prev, res]))
        .finally(() => {
          runningRef.current -= 1
          tick()
        })
    }
  }, [concurrency])

  const reset = useCallback(() => {
    queueRef.current = []
    runningRef.current = 0
    setProgress({})
    setResults([])
  }, [])

  return { push, progress, results, reset }
}

