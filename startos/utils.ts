import { utils } from '@start9labs/start-sdk'
import * as diskusage from 'diskusage'
import { totalmem } from 'os'
import { sdk } from './sdk'

/**
 * Shared constants and helpers for the Elements (Liquid) package. The
 * cross-package dependency contract these values define is documented in
 * README.md § The Dependency Contract.
 */

export const chain = 'liquidv1'

// Exported for dependent packages: `sdk.host.getBridgeAddress` keys off the
// host id + internal port to resolve the address they reach this node at.
export const rpcHostId = 'rpc'
export const peerHostId = 'peer'
export const rpcInterfaceId = 'rpc'
export const peerInterfaceId = 'peer'

// Liquid mainnet (liquidv1) RPC default port
export const rpcPort = 7041

// Liquid mainnet (liquidv1) P2P default port
export const peerPort = 7042

// elementsd inside its container stores everything under this datadir.
// The `main` volume is mounted here, so on the volume the layout is:
//   /root/.elements/elements.conf
//   /root/.elements/liquidv1/.cookie
//   /root/.elements/liquidv1/wallets/peerswap/...
export const rootDir = '/root/.elements'

// chain-specific subdirectory created by elementsd for liquidv1
export const chainDir = `${rootDir}/${chain}`

export const rpccookiefile = '.cookie'
export const cookiePath = `${chainDir}/${rpccookiefile}`

export const rpcbind = '0.0.0.0'
export const rpcallowip = '0.0.0.0/0'

// Wallet pre-created for peerswap and other Liquid consumers.
export const defaultWallet = 'peerswap'

export const diskUsage = utils.once(() => diskusage.check('/'))

/**
 * Disk below which an unpruned Liquid node is not a responsible default. The
 * chain is ~90 GB and adding tens of GB a year; this leaves room for it to
 * roughly double alongside whatever else the box runs.
 */
export const archivalMin = 400_000_000_000

/** elementsd's floor for `prune`, inherited from Bitcoin Core. */
export const minPrune = 550

/** Free space below which the node is at real risk of wedging mid-sync. */
export const diskCriticalBytes = 5_000_000_000
export const diskWarningBytes = 20_000_000_000

export const defaultDbcache = () =>
  Math.min(Math.floor((totalmem() * 0.15) / (1024 * 1024)), 2_048)

export const elementsMounts = sdk.Mounts.of().mountVolume({
  volumeId: 'main',
  subpath: null,
  mountpoint: rootDir,
  readonly: false,
})

/** elements-cli connection args, used by the daemon health check + actions. */
export function elementsCliArgs(): string[] {
  return [
    'elements-cli',
    `-datadir=${rootDir}`,
    `-chain=${chain}`,
    `-rpccookiefile=${cookiePath}`,
    `-rpcport=${rpcPort}`,
    '-rpcconnect=127.0.0.1',
  ]
}

export type GetBlockchainInfo = {
  chain: string
  blocks: number
  headers: number
  bestblockhash: string
  mediantime: number
  verificationprogress: number
  initialblockdownload: boolean
  size_on_disk: number
  pruned: boolean
  warnings?: string | string[]
}

export type GetNetworkInfo = {
  version: number
  subversion: string
  connections: number
  connections_in?: number
  connections_out?: number
}

export type GetWalletInfo = {
  walletname: string
  balance?: Record<string, number> | number
}
