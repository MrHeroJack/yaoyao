import { ACTIVE_PROVIDER } from '../../config/storage'
import { IStorageProvider } from './IStorageProvider'
import { QiniuProvider } from './QiniuProvider'
import { OSSProvider } from './OSSProvider'
import { LinkOnlyProvider } from './LinkOnlyProvider'

export function getProvider(): IStorageProvider {
  if (ACTIVE_PROVIDER === 'qiniu') return new QiniuProvider()
  if (ACTIVE_PROVIDER === 'oss') return new OSSProvider()
  return new LinkOnlyProvider()
}

