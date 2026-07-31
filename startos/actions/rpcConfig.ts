import { elementsConfFile, fullConfigSpec } from '../fileModels/elements.conf'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const rpcConfig = sdk.Action.withInput(
  'config',

  async ({ effects }) => ({
    name: i18n('Configuration'),
    description: i18n('Edit performance and RPC tunables in elements.conf'),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Configuration'),
    visibility: 'enabled',
  }),

  fullConfigSpec.filter({
    prune: true,
    txindex: true,
    dbcache: true,
    rpcthreads: true,
    rpcworkqueue: true,
    maxconnections: true,
  }),

  async ({ effects }) => elementsConfFile.read().once(),

  ({ effects, input }) => elementsConfFile.merge(effects, input),
)
