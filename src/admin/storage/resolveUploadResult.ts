import type { IStorageProvider, UploadResult } from './IStorageProvider'

export async function resolveUploadResult(
  task: ReturnType<IStorageProvider['upload']>,
): Promise<UploadResult> {
  if (task instanceof Promise) return task
  return task.promise
}
