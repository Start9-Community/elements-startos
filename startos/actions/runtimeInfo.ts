import { T } from '@start9labs/start-sdk'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import {
  chain,
  cookiePath,
  defaultWallet,
  elementsCliArgs,
  elementsMounts,
  GetBlockchainInfo,
  GetNetworkInfo,
  rpcHostId,
  rpcPort,
} from '../utils'

export const runtimeInfo = sdk.Action.withoutInput(
  'runtime-info',

  async ({ effects }) => ({
    name: i18n('Runtime & Connection Info'),
    description: i18n(
      'Liquid sync status plus the RPC connection details that dependent services use',
    ),
    warning: null,
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'enabled',
  }),

  async ({ effects }) => {
    const value: T.ActionResultMember[] = []

    const rpcAddress = await sdk.host
      .getBridgeAddress(effects, { hostId: rpcHostId, internalPort: rpcPort })
      .once()

    value.push({
      type: 'group',
      name: i18n('Connection (for dependents)'),
      description: null,
      value: [
        single(
          i18n('RPC Address'),
          rpcAddress ?? i18n('Not yet assigned'),
          true,
        ),
        single(i18n('Cookie Path (in volume)'), cookiePath, true),
        single(i18n('Wallet'), defaultWallet, true),
      ],
    })

    try {
      const { bci, ni } = await sdk.SubContainer.withTemp(
        effects,
        { imageId: 'elements' },
        elementsMounts,
        'elements-runtime-info',
        async (subc) => {
          const call = async (method: string) =>
            JSON.parse(
              String(
                (await subc.execFail([...elementsCliArgs(), method])).stdout,
              ),
            )
          return {
            bci: (await call('getblockchaininfo')) as GetBlockchainInfo,
            ni: (await call('getnetworkinfo')) as GetNetworkInfo,
          }
        },
      )

      value.push({
        type: 'group',
        name: i18n('Liquid Node'),
        description: null,
        value: [
          single(i18n('Chain'), bci.chain || chain, false),
          single(i18n('Block Height'), String(bci.blocks), false),
          single(i18n('Header Height'), String(bci.headers), false),
          single(
            i18n('Sync Progress'),
            bci.initialblockdownload
              ? `${(bci.verificationprogress * 100).toFixed(2)}%`
              : '100%',
            false,
          ),
          single(i18n('Peer Connections'), String(ni.connections), false),
          single(i18n('Version'), ni.subversion || String(ni.version), false),
        ],
      })
    } catch {
      value.push(
        single(
          i18n('Liquid Node'),
          i18n('RPC not reachable yet (node may still be starting).'),
          false,
        ),
      )
    }

    return {
      version: '1',
      title: i18n('Elements (Liquid) Runtime Info'),
      message: null,
      result: { type: 'group', value },
    }
  },
)

function single(
  name: string,
  value: string,
  copyable: boolean,
): T.ActionResultMember {
  return {
    type: 'single',
    name,
    description: null,
    value,
    copyable,
    masked: false,
    qr: false,
  }
}
