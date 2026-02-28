import { useCallback, useRef, useState } from 'react'
import { getProvider } from '../storage/providerFactory'
import type { UploadResult, UploadProgress } from '../storage/IStorageProvider'
import { resolveUploadResult } from '../storage/resolveUploadResult'

export function useUpload(concurrency = 3) {
  const [progress, setProgress] = useState<Record<string, UploadProgress>>({})
  const [results, setResults] = useState<UploadResult[]>([])
  const queueRef = useRef<File[]>([])
  const runningRef = useRef<number>(0)

  const tick = useCallback(async () => {
    const provider = await getProvider()

    while (runningRef.current < concurrency && queueRef.current.length) {
      const file = queueRef.current.shift()!
      runningRef.current += 1
      const id = `${file.name}-${file.size}-${file.lastModified}`
      const task = provider.upload(file, (p) => setProgress((prev) => ({ ...prev, [id]: p })))
      resolveUploadResult(task)
        .then((res: UploadResult) => setResults((prev) => [...prev, res]))
        .finally(() => {
          runningRef.current -= 1
          tick().catch(() => {})
        })
    }
  }, [concurrency])

  const push = useCallback((files: File[]) => {
    queueRef.current.push(...files)
    tick().catch(() => {})
  }, [tick])

  const reset = useCallback(() => {
    queueRef.current = []
    runningRef.current = 0
    setProgress({})
    setResults([])
  }, [])

  return { push, progress, results, reset }
}
