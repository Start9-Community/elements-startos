export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'The Liquid RPC interface is ready': 0,
  'The Liquid RPC interface is not ready': 1,
  'Liquid Sync': 2,
  'Syncing Liquid blocks...${percentage}%': 3,
  'Sync Complete': 4,
  'The Liquid sidechain is fully synced.': 5,
  'Liquid is fully synced': 6,
  'Liquid is starting…': 7,

  // interfaces.ts
  'RPC Interface': 8,
  'Listens for Liquid (elementsd) JSON-RPC commands from dependent services': 9,

  // fileModels/elements.conf.ts
  Default: 10,
  'Database Cache': 11,
  'How much RAM (in MiB) to allocate for caching during sync. Higher values speed up initial sync.': 12,
  'RPC Threads': 13,
  'Number of threads for handling RPC calls.': 14,
  'RPC Work Queue': 15,
  'Depth of the work queue used to service RPC calls.': 16,
  'Maximum Connections': 17,
  'Maximum number of peer connections to maintain.': 18,

  // actions/rpcConfig.ts
  Configuration: 19,
  'Edit performance and RPC tunables in elements.conf': 20,

  // actions/runtimeInfo.ts
  'Runtime & Connection Info': 21,
  'Liquid sync status plus the RPC connection details that dependent services use': 22,
  'Connection (for dependents)': 23,
  'Cookie Path (in volume)': 26,
  Wallet: 27,
  'Liquid Node': 28,
  Chain: 29,
  'Block Height': 30,
  'Header Height': 31,
  'Sync Progress': 32,
  'Peer Connections': 33,
  Version: 34,
  'RPC not reachable yet (node may still be starting).': 35,
  'Elements (Liquid) Runtime Info': 36,

  // fileModels/elements.conf.ts + main.ts (disk / pruning)
  Pruning: 37,
  'Maximum size of Liquid block data to keep on disk. Set to 0 to keep the entire sidechain (full archival). PeerSwap and other swap consumers only ever look back about an hour of blocks, so even the smallest prune target leaves them a wide margin.': 38,
  'Lowering this value on an already-synced node discards blocks immediately. Raising it, or switching back to full archival, requires a full re-sync. Pruning also disables the Transaction Index.': 39,
  'Transaction Index': 40,
  'Build a complete index of every Liquid transaction, so `getrawtransaction` can look up any transaction by id alone. Not required by PeerSwap, and it adds several GB on top of an already large chain.': 41,
  'Not enough disk space': 42,
  'Disk Space': 43,
  'Only ${free} GB free. Stop Elements and free space — elementsd can corrupt its chain data if it runs the disk out.': 44,
  'Low Disk Space': 45,
  'Elements has ${free} GB of disk left. The Liquid sidechain grows several GB a month — enable Pruning under the Configuration action to cap what it keeps.': 46,
  '${free} GB free — running low': 47,
  '${free} GB free': 48,

  // interfaces.ts
  'Peer Interface': 49,
  'Listens for incoming connections from peers on the Liquid network': 50,

  // actions/runtimeInfo.ts
  'RPC Address': 51,
  'Not yet assigned': 52,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
