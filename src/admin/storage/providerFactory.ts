import { ACTIVE_PROVIDER } from '../../config/storage'
import type { IStorageProvider } from './IStorageProvider'

let providerPromise: Promise<IStorageProvider> | null = null

export async function getProvider(): Promise<IStorageProvider> {
  if (providerPromise) return providerPromise

  providerPromise = (async () => {
    if (ACTIVE_PROVIDER === 'qiniu') {
      const mod = await import('./QiniuProvider')
      return new mod.QiniuProvider()
    }

    if (ACTIVE_PROVIDER === 'oss') {
      const mod = await import('./OSSProvider')
      return new mod.OSSProvider()
    }

    const mod = await import('./LinkOnlyProvider')
    return new mod.LinkOnlyProvider()
  })()

  return providerPromise
}
