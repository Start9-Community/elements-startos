import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

export const shape = z.looseObject({
  // Set once the node finishes initial block download, to avoid re-firing
  // the "Sync Complete" notification on every restart.
  fullySynced: z.boolean().catch(false),
  // Set once the `peerswap` wallet has been created/loaded.
  walletCreated: z.boolean().catch(false),
})

export const storeJson = FileHelper.json(
  {
    base: sdk.volumes.main,
    subpath: '/store.json',
  },
  shape,
)
