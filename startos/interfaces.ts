import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  peerHostId,
  peerInterfaceId,
  peerPort,
  rpcHostId,
  rpcInterfaceId,
  rpcPort,
} from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const rpcMulti = sdk.MultiHost.of(effects, rpcHostId)
  const rpcMultiOrigin = await rpcMulti.bindPort(rpcPort, {
    protocol: 'http',
    preferredExternalPort: rpcPort,
  })
  const rpc = sdk.createInterface(effects, {
    name: i18n('RPC Interface'),
    id: rpcInterfaceId,
    description: i18n(
      'Listens for Liquid (elementsd) JSON-RPC commands from dependent services',
    ),
    type: 'api',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })

  const rpcReceipt = await rpcMultiOrigin.export([rpc])

  const peerMulti = sdk.MultiHost.of(effects, peerHostId)
  const peerMultiOrigin = await peerMulti.bindPort(peerPort, {
    protocol: null,
    preferredExternalPort: peerPort,
    addSsl: null,
    secure: { ssl: false },
  })
  const peer = sdk.createInterface(effects, {
    name: i18n('Peer Interface'),
    id: peerInterfaceId,
    description: i18n(
      'Listens for incoming connections from peers on the Liquid network',
    ),
    type: 'p2p',
    masked: false,
    schemeOverride: { ssl: null, noSsl: null },
    username: null,
    path: '',
    query: {},
  })
  const peerReceipt = await peerMultiOrigin.export([peer])

  return [rpcReceipt, peerReceipt]
})
