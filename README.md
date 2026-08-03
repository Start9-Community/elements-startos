<p align="center">
  <img src="icon.svg" alt="Elements (Liquid) Logo" width="21%">
</p>

# Elements (Liquid) on StartOS

> **Upstream docs:** <https://docs.liquid.net/>
>
> Everything not listed in this document should behave the same as upstream
> Elements Core. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable.

Elements Core (`elementsd`) packaged for StartOS as a Liquid mainnet
(`liquidv1`) full node. It exposes a JSON-RPC interface and a wallet so that
other StartOS services — primarily PeerSwap — can use Liquid (L-BTC)
functionality. Upstream repository:
<https://github.com/ElementsProject/elements>.

This README documents the package architecture for developers and LLMs. End-user
docs are in [`instructions.md`](instructions.md).

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [Disk Footprint](#disk-footprint)
- [The Dependency Contract](#the-dependency-contract)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Configuration Management](#configuration-management)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Actions (StartOS UI)](#actions-startos-ui)
- [Backups and Restore](#backups-and-restore)
- [Health Checks](#health-checks)
- [Dependencies](#dependencies)
- [Limitations and Differences](#limitations-and-differences)
- [What Is Unchanged from Upstream](#what-is-unchanged-from-upstream)
- [Contributing](#contributing)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

| Property      | Value                                                                                                                  |
| ------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Image         | custom `Dockerfile` — downloads the official Elements release tarball and verifies it against the release `SHA256SUMS` |
| Architectures | x86_64, aarch64                                                                                                        |
| Entrypoint    | none; StartOS invokes `elementsd -datadir=/root/.elements` directly                                                    |
| CLI           | `elements-cli`, used by the health checks and the runtime-info action                                                  |

The upstream version is pinned by the `VERSION` build arg in
`startos/manifest/index.ts`. See [`UPDATING.md`](UPDATING.md) for the bump
procedure.

---

## Volume and Data Layout

| Volume | Mount Point       | Purpose                            |
| ------ | ----------------- | ---------------------------------- |
| `main` | `/root/.elements` | Config, chain data, wallet, cookie |

On the `main` volume:

```
/root/.elements/elements.conf
/root/.elements/store.json          # StartOS-managed: sync + wallet flags
/root/.elements/liquidv1/.cookie
/root/.elements/liquidv1/blocks/
/root/.elements/liquidv1/chainstate/
/root/.elements/liquidv1/wallets/peerswap/
```

---

## Disk Footprint

This is the dominant operational cost of the package, and the reason several of
its defaults differ from a naive Elements install.

Liquid produces a block every minute and has been running since 2018, so the
sidechain is well past **80 GB** of raw block data — and the growth rate is
climbing steeply, with recent blocks an order of magnitude larger than
mid-history ones. Treat "tens of GB per year, accelerating" as the planning
figure rather than any number written here.

Three package decisions follow from that:

1. **`txindex` defaults off** (upstream's own default). It is not required by
   PeerSwap — PeerSwap resolves swap transactions with
   `getrawtransaction <txid> <verbose> <blockhash>` over a bounded block range,
   which needs no index — and it adds several GB to an already large chain.
2. **Pruning is exposed** through the Configuration action, and defaults to a
   pruned target on hosts whose disk is too small for an archival node. A
   pruned node still serves every swap consumer: PeerSwap's Liquid CSV window
   is 60 blocks (one hour), so even the smallest legal prune target retains
   orders of magnitude more history than it reads.
3. **A `Disk Space` health check** runs alongside the daemon. It fails the
   service when free space drops to a few GB — the point at which `elementsd`
   risks corrupting its chainstate — and raises a StartOS notification once per
   service start while space is merely low.

`hardwareRequirements.ram` gates installation on hosts with too little memory to
run the daemon alongside StartOS itself. StartOS compares it against host RAM
**in bytes**, so the 4 GB floor is written `4 * 1024 ** 3` — a plain `4096` would
declare 4 KiB and gate nothing.

---

## The Dependency Contract

A dependent (e.g. `peerswap`) mounts this package's `main` volume **read-only**
for credentials, and resolves the RPC address over the LXC bridge with
`sdk.host.getBridgeAddress`:

| Field         | Value                                                                   |
| ------------- | ----------------------------------------------------------------------- |
| Host id       | `rpc` (exported as `rpcHostId` from `startos/utils.ts`)                 |
| Internal port | `7041` (exported as `rpcPort`)                                          |
| Cookie file   | `<mountpoint>/liquidv1/.cookie` (e.g. `/mnt/elements/liquidv1/.cookie`) |
| Cookie format | `__cookie__:<password>` — split on the first `:`                        |
| Wallet        | `peerswap`, pre-created on first run                                    |
| Health check  | `elementsd` — RPC readiness, not full sync                              |

Do **not** hardcode `elements.startos:7041`: that DNS form is retired, and the
address a dependent reaches this node at is a property of how the binding was
made. Import `rpcHostId` / `rpcPort` and let the SDK resolve it.

The cookie is the primary credential surface — always present, regenerated each
run. `rpcuser` / `rpcpassword` may optionally be set in `elements.conf` for
fixed credentials instead.

---

## Installation and First-Run Flow

There is no upstream setup wizard to skip and no credential to hand the user;
the node is a backend.

1. `seedFiles` writes `elements.conf` (enforced keys plus defaults) and
   `store.json`.
2. `main.ts` removes any stale RPC cookie, then starts `elementsd`, which begins
   initial block download of the Liquid sidechain.
3. Once RPC is reachable, the `create-wallet` oneshot loads or creates the
   `peerswap` wallet with `load_on_startup=true`, so the wallet is pinned in
   `settings.json` and reloads with the daemon even if a later start races IBD.
4. The `Liquid Sync` health check tracks IBD and fires a one-time "Sync
   Complete" notification when it finishes.

---

## Configuration Management

`elements.conf` is managed by the `elementsConfFile` FileHelper
(`startos/fileModels/elements.conf.ts`). Unknown keys already in the file are
preserved.

| StartOS-Managed (enforced)                                                                        | User-Managed (Configuration action)                                           |
| ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `chain`, `server`, `listen`, `validatepegin`, `rpcbind`, `rpcallowip`, `rpcport`, `rpccookiefile` | `prune`, `txindex`, `dbcache`, `rpcthreads`, `rpcworkqueue`, `maxconnections` |

Enforced keys keep the node reachable from the StartOS internal network and pin
it to the Liquid mainnet sidechain. `prune` and `txindex` are mutually exclusive
in Elements; setting a prune target forces `txindex` off on write.

---

## Network Access and Interfaces

| Interface      | Host id | Port | Type  | Purpose                                         |
| -------------- | ------- | ---- | ----- | ----------------------------------------------- |
| RPC Interface  | `rpc`   | 7041 | `api` | Liquid JSON-RPC, consumed by dependent services |
| Peer Interface | `peer`  | 7042 | `p2p` | Inbound connections from Liquid network peers   |

Both are ordinary StartOS interfaces: the **user** decides where each is
reachable. There is no web UI — this package is a backend, not a user-facing
app.

---

## Actions (StartOS UI)

| Action                        | Id             | Visibility | Availability | Inputs                                                                        | Outputs                                                                |
| ----------------------------- | -------------- | ---------- | ------------ | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **Configuration**             | `config`       | enabled    | any status   | `prune`, `txindex`, `dbcache`, `rpcthreads`, `rpcworkqueue`, `maxconnections` | writes `elements.conf`                                                 |
| **Runtime & Connection Info** | `runtime-info` | enabled    | only running | none                                                                          | sync status, peer count, and the RPC connection details dependents use |

`prune` and `txindex` are dynamic values: their bounds and availability are
computed from the host's disk size, so an archival node cannot be selected on a
disk that cannot hold one.

---

## Backups and Restore

**Included:** the `main` volume — `elements.conf`, `store.json`, and the Liquid
wallet under `liquidv1/wallets/`.

**Excluded (re-syncable or runtime-only):** `liquidv1/blocks/`,
`liquidv1/chainstate/`, `liquidv1/indexes/`, `liquidv1/.cookie`, lock and pid
files, and SQLite journals.

A restore therefore returns the wallet immediately and re-syncs the chain from
scratch.

---

## Health Checks

| Check       | Id              | Method                                          | Notes                                                          |
| ----------- | --------------- | ----------------------------------------------- | -------------------------------------------------------------- |
| RPC         | `elementsd`     | cookie file exists, then port 7041 is listening | The daemon's `ready`; this is what dependents gate on          |
| Liquid Sync | `sync-progress` | `getblockchaininfo` via `elements-cli`          | `loading` with a percentage during IBD, `success` once synced  |
| Disk Space  | `disk-space`    | free space on the data filesystem               | `failure` below a few GB; notification once per start when low |

`elementsd` carries a 120 s `sigtermTimeout` so the daemon can flush chainstate
on shutdown.

---

## Dependencies

**None.** This is a standalone Liquid full node (`validatepegin=0`) — other
packages depend on it.

---

## Limitations and Differences

1. **Liquid mainnet only** (`chain=liquidv1`). Bitcoin mainnet, testnet, and
   Liquid testnet are not selectable.
2. **No peg-in validation** (`validatepegin=0`). Upstream defaults this on,
   which requires a full Bitcoin node alongside Elements; this package turns it
   off, which is the correct mode for wallet and swap use and removes the
   Bitcoin-node requirement. Peg-in transactions are therefore not validated
   against the Bitcoin chain.
3. **No web UI.** The package is a backend for other services.
4. **A wallet named `peerswap` is created on first run** whether or not PeerSwap
   is installed.
5. **`prune` and `txindex` cannot both be set.** Choosing a prune target clears
   `txindex`.

---

## What Is Unchanged from Upstream

- The `elementsd` and `elements-cli` binaries are the official release builds,
  unmodified.
- The full JSON-RPC surface, including the wallet RPCs, behaves exactly as
  upstream documents.
- Chain validation, peer-to-peer behavior, mempool policy, and the on-disk data
  format are stock.
- Any `elements.conf` key not listed under Configuration Management above is
  passed through untouched.

---

## Contributing

See [`AGENTS.md`](AGENTS.md).

---

## Quick Reference for AI Consumers

```yaml
package_id: elements
title: Elements (Liquid)
architectures: [x86_64, aarch64]
chain: liquidv1
volumes:
  main: /root/.elements
ports:
  rpc: 7041
  peer: 7042
interfaces:
  rpc:
    host_id: rpc
    type: api
    port: 7041
  peer:
    host_id: peer
    type: p2p
    port: 7042
dependency_contract:
  resolve_address_with: sdk.host.getBridgeAddress
  host_id: rpc
  internal_port: 7041
  cookie_file: <mountpoint>/liquidv1/.cookie
  cookie_format: '__cookie__:<password>'
  wallet: peerswap
  health_check: elementsd
enforced_conf:
  chain: liquidv1
  server: 1
  listen: 1
  validatepegin: 0
  rpcbind: 0.0.0.0
  rpcallowip: 0.0.0.0/0
  rpcport: 7041
  rpccookiefile: .cookie
user_conf: [prune, txindex, dbcache, rpcthreads, rpcworkqueue, maxconnections]
health_checks: [elementsd, sync-progress, disk-space]
actions:
  - config
  - runtime-info
dependencies: none
startos_managed_env_vars: []
```
