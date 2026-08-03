import * as diskusage from 'diskusage'
import { access, rm } from 'fs/promises'
import { elementsConfFile } from './fileModels/elements.conf'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  cookiePath,
  defaultWallet,
  diskCriticalBytes,
  diskWarningBytes,
  elementsCliArgs,
  elementsMounts,
  GetBlockchainInfo,
  rootDir,
  rpcPort,
} from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  /**
   * ======================== Setup ========================
   */
  console.info('Starting Elements (Liquid)!')

  const store = await storeJson.read().once()
  if (!store) throw new Error('No store')

  // read elements.conf and watch for changes (restart on edit)
  const elementsConf = await elementsConfFile.read().const(effects)
  if (!elementsConf) throw new Error('No elements.conf')

  // eager: `rootfs` is read synchronously below, which a lazy handle only
  // exposes as a Promise
  const elementsSub = await sdk.SubContainer.eager(
    effects,
    { imageId: 'elements' },
    elementsMounts,
    'elements-sub',
  )

  const cookieFsPath = `${elementsSub.rootfs}${cookiePath}`

  let lowDiskNotified = false

  // remove any stale cookie so the RPC ready-check only passes once the daemon
  // has actually re-created it for this run
  await rm(cookieFsPath, { force: true, recursive: true })

  /**
   * ======================== Daemons ========================
   */
  return (
    sdk.Daemons.of(effects)
      .addDaemon('elementsd', {
        subcontainer: elementsSub,
        exec: {
          command: ['elementsd', `-datadir=${rootDir}`],
          sigtermTimeout: 120_000,
        },
        ready: {
          display: 'RPC',
          fn: async () => {
            try {
              await access(cookieFsPath)
            } catch {
              return {
                message: i18n('The Liquid RPC interface is not ready'),
                result: 'starting',
              }
            }
            return sdk.healthCheck.checkPortListening(effects, rpcPort, {
              successMessage: i18n('The Liquid RPC interface is ready'),
              errorMessage: i18n('The Liquid RPC interface is not ready'),
            })
          },
        },
        requires: [],
      })
      // Create/load the `peerswap` wallet once RPC is up so dependents find it.
      .addOneshot('create-wallet', {
        subcontainer: elementsSub,
        exec: {
          fn: async () => {
            // Try to load it first; if it doesn't exist, create it. Both pass
            // load_on_startup=true so elementsd pins the wallet in its
            // settings.json — the wallet then loads with the daemon even if
            // this oneshot races a slow start (e.g. elementsd mid-IBD, where
            // loadwallet can time out and leave the wallet unloaded).
            const load = await elementsSub.exec([
              ...elementsCliArgs(),
              'loadwallet',
              defaultWallet,
              'true',
            ])
            if (load.exitCode !== 0) {
              const create = await elementsSub.exec([
                ...elementsCliArgs(),
                '-named',
                'createwallet',
                `wallet_name=${defaultWallet}`,
                'load_on_startup=true',
              ])
              if (create.exitCode === 0 && !store.walletCreated) {
                await storeJson.merge(effects, { walletCreated: true })
              }
            } else if (!store.walletCreated) {
              await storeJson.merge(effects, { walletCreated: true })
            }
            return null
          },
        },
        requires: ['elementsd'],
      })
      // Surface initial-block-download / verification progress.
      .addHealthCheck('sync-progress', {
        ready: {
          display: i18n('Liquid Sync'),
          trigger: sdk.trigger.statusTrigger(30_000, {
            starting: 5_000,
            failure: 5_000,
          }),
          fn: async () => {
            const res = await elementsSub.exec([
              ...elementsCliArgs(),
              'getblockchaininfo',
            ])

            if (
              res.exitCode === 0 &&
              typeof res.stdout === 'string' &&
              res.stdout !== ''
            ) {
              const info: GetBlockchainInfo = JSON.parse(res.stdout)

              if (info.initialblockdownload) {
                const percentage = (info.verificationprogress * 100).toFixed(2)
                return {
                  message: i18n('Syncing Liquid blocks...${percentage}%', {
                    percentage,
                  }),
                  result: 'loading',
                }
              }

              if (!store.fullySynced) {
                await sdk.notification.create(effects, {
                  level: 'success',
                  title: i18n('Sync Complete'),
                  message: i18n('The Liquid sidechain is fully synced.'),
                })
                await storeJson.merge(effects, { fullySynced: true })
                store.fullySynced = true
              }

              return {
                message: i18n('Liquid is fully synced'),
                result: 'success',
              }
            }

            return {
              message: i18n('Liquid is starting…'),
              result: 'starting',
            }
          },
        },
        requires: ['elementsd'],
      })
      .addHealthCheck('disk-space', {
        ready: {
          display: i18n('Disk Space'),
          trigger: sdk.trigger.statusTrigger(300_000, { failure: 60_000 }),
          fn: async () => {
            const { available } = await diskusage.check('/')
            const free = (available / 1_000_000_000).toFixed(1)

            if (available < diskCriticalBytes) {
              return {
                message: i18n(
                  'Only ${free} GB free. Stop Elements and free space — elementsd can corrupt its chain data if it runs the disk out.',
                  { free },
                ),
                result: 'failure',
              }
            }

            if (available < diskWarningBytes) {
              if (!lowDiskNotified) {
                lowDiskNotified = true
                await sdk.notification.create(effects, {
                  level: 'warning',
                  title: i18n('Low Disk Space'),
                  message: i18n(
                    'Elements has ${free} GB of disk left. The Liquid sidechain grows several GB a month — enable Pruning under the Configuration action to cap what it keeps.',
                    { free },
                  ),
                })
              }
              return {
                message: i18n('${free} GB free — running low', { free }),
                result: 'success',
              }
            }

            lowDiskNotified = false
            return {
              message: i18n('${free} GB free', { free }),
              result: 'success',
            }
          },
        },
        requires: [],
      })
  )
})
