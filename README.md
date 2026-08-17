<p align="center">
  <img src="icon.png" alt="Elements Logo" width="21%">
</p>

# Elements (Liquid) on StartOS

> Everything not listed in this document should behave the same as upstream
> Elements. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

[Elements](https://github.com/ElementsProject/elements) is the node software behind the Liquid sidechain. This package runs a Liquid mainnet node for other services to depend on — PeerSwap above all — pre-creates the wallet they expect, and manages the one thing that actually costs anything here: disk.

- **Upstream repo:** <https://github.com/ElementsProject/elements>
- **Wrapper repo:** <https://github.com/Start9-Community/elements-startos>

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

One image, built here from a pinned upstream version.

| Property      | Value                                |
| ------------- | ------------------------------------ |
| Image         | Built from this repo's `Dockerfile`  |
| Architectures | x86_64, aarch64                      |
| Memory        | Requires a machine of 4 GB or better |

| Subcontainer   | Purpose                                                    |
| -------------- | ---------------------------------------------------------- |
| `elements-sub` | The daemon and the wallet oneshot — the one to `attach` to |

The memory floor is where `elementsd`'s working set plus its cache coexists with StartOS and a Lightning stack rather than driving the box into swap. The declared value is deliberately set below the round number, because StartOS compares it against reported memory, which reads a few hundred MiB under the advertised capacity — a literal 4 GiB would reject every 4 GB machine.

## Volume and Data Layout

One volume, mounted as the node's data directory.

| Volume | Mount Point       | Purpose                                          |
| ------ | ----------------- | ------------------------------------------------ |
| `main` | `/root/.elements` | The chain, the config, the wallet, and the store |

| Path                            | Holds                                    |
| ------------------------------- | ---------------------------------------- |
| `elements.conf`                 | The node configuration                   |
| `liquidv1/blocks`, `chainstate` | The sidechain itself                     |
| `liquidv1/.cookie`              | The RPC credential, regenerated each run |
| `liquidv1/wallets/peerswap/`    | The pre-created wallet                   |
| `store.json`                    | Package state                            |

**Disk is the dominant operational cost of this package**, and the reason several of its defaults differ from a naive Elements install. Liquid produces a block a minute and has been running for years, so the chain is well past 80 GB and growing — with recent blocks an order of magnitude larger than mid-history ones. Plan on tens of GB a year, accelerating.

Three decisions follow from that, and they are covered under [File Models](#file-models) and [Health Checks](#health-checks): the transaction index is off, pruning is offered and defaults on for small disks, and a disk check runs alongside the daemon.

## File Models

Two models. The config's fields fall into three groups, and which group a key is in decides whether an edit survives.

| File            | Format | Modelled                | Written by                        |
| --------------- | ------ | ----------------------- | --------------------------------- |
| `elements.conf` | INI    | Yes — `FileHelper.ini`  | Init and the Configuration action |
| `store.json`    | JSON   | Yes — `FileHelper.json` | `main`                            |

- **Enforced.** The chain, server and listen flags, the peg-in validation setting, and the whole RPC binding are `z.literal(...).catch(...)` — a changed value is **repaired on read**, not merely overwritten. They pin the node to Liquid mainnet and keep it reachable from the internal network.
- **Optional credentials.** An RPC username and password may be set, letting a dependent authenticate without reading the cookie. The cookie remains the primary credential and is always present.
- **User-tunable.** Pruning, the transaction index, the database cache, RPC threads and work queue, connection limit, and the fallback fee.

INI values read back as strings, and duplicate keys as arrays; the model coerces both.

**Two of the tunables are sized against the actual disk**, not offered blindly:

- **Pruning** defaults to a pruned target on hosts too small for an archival node, and to full archival otherwise. Its maximum is half the disk. A value between zero and upstream's floor is silently raised to that floor rather than rejected. **Lowering it on a synced node discards blocks immediately; raising it, or going back to archival, requires a full re-sync** — and pruning disables the transaction index.
- **The transaction index** is off by default, matching upstream, and is **disabled outright on a disk too small for it**. It is not required by PeerSwap, which resolves swap transactions over a bounded block range, and it adds several GB to an already large chain.

`store.json` holds two flags used to avoid repeating themselves: whether the node has ever finished syncing, and whether the wallet has been created.

## Dependencies

None. This is a standalone Liquid node — other packages depend on **it**.

**What a dependent needs to know:** mount this package's `main` volume read-only for the cookie, and resolve the RPC address over the internal bridge using the host id and internal port this package exports from its source. Do not hardcode a `.startos` DNS name; that form is retired, and the address a dependent reaches is a property of how the binding was made.

The cookie sits at `liquidv1/.cookie` inside the mount, in `__cookie__:<password>` form — split on the first colon. The `peerswap` wallet is pre-created on first run. The dependency health check to require is the daemon's RPC readiness, **not** full sync: a dependent that waits for a fully-synced Liquid node waits days.

## Network Access and Interfaces

Two interfaces.

| Interface      | Id     | Type | Port | Description                                  |
| -------------- | ------ | ---- | ---- | -------------------------------------------- |
| RPC Interface  | `rpc`  | api  | 7041 | JSON-RPC, for dependent services             |
| Peer Interface | `peer` | p2p  | 7042 | Incoming connections from the Liquid network |

The RPC binds over HTTP; the peer interface is raw TCP with no TLS, as the network protocol requires. Both request their standard ports as the external one.

The RPC is bound to all interfaces inside the container and allows any source — reachability is StartOS's decision at the network layer, not the daemon's, and binding it narrowly would only stop the OS reaching it.

## Installation and First-Run Flow

Install writes the enforced configuration and the defaults into `elements.conf`. That merge runs on **every** lifecycle event, not just install, so the enforced keys are re-asserted after an update or a restore.

Then the node starts and begins syncing, which is the long part — days, not hours, and the chain is large enough that disk should be checked before starting rather than after.

Once RPC is answering, a oneshot ensures the `peerswap` wallet exists: it tries to load it, creates it if that fails, and pins it to load with the daemon either way. **The pinning matters** — the oneshot can race a slow start during initial sync, where loading a wallet can time out, and without the pin the wallet would silently stay unloaded.

A notification is sent when sync first completes, so the wait does not have to be watched.

## Actions

Two actions.

### Configuration — Configuration group

Sets pruning, the transaction index, and the performance tunables.

- **What it changes:** the user-tunable keys in `elements.conf`.
- **Cost:** applies on restart.
- **Repeat safety:** idempotent — but two of the settings are not reversible in effect. **Lowering the prune target discards blocks the moment the node restarts**, and raising it back, or returning to archival, means re-syncing the whole chain. The action's own warning says so.
- **The form adapts to the disk it is running on**, disabling the transaction index and floor-ing pruning where there is not room.

### Runtime & Connection Info

Reports the node's version, connection count, sync state, wallet, and the connection details a dependent needs.

- **When to run it:** only while the service is running.
- **What it changes:** nothing.
- **Repeat safety:** read-only.
- **Use it to answer "what does my dependent need"** rather than reading files off the volume.

## Tasks

None. This package raises no tasks, so the service is never held on a prompt and its ordinary controls are always available.

## Health Checks

Three checks.

| Check           | Displayed as  | Method                         | Cadence                        |
| --------------- | ------------- | ------------------------------ | ------------------------------ |
| `elementsd`     | "RPC"         | The RPC is answering           | default                        |
| `sync-progress` | "Liquid Sync" | Verification progress from RPC | every 30s                      |
| `disk-space`    | "Disk Space"  | Free space on the volume       | every 5 min, every 60s failing |

**"RPC" is the check dependents should gate on**, and it goes green long before the node is synced. That is intended: a dependent that waits for full sync waits days, and most of them only read recent blocks.

**"Disk Space" fails the service outright below a few GB free**, and that is the point of it: `elementsd` can corrupt its chain data if it runs the disk out, so failing loudly beats letting it continue. Between that and a wider threshold it stays green but warns, and raises a notification **once** rather than on every poll — the flag resets when free space recovers.

Its slow cadence is deliberate: free space does not change quickly, and a five-minute poll costs nothing. It tightens to a minute once failing.

## Backups and Restore

The `main` volume is copied **except the chain**: blocks, chainstate, indexes, the cookie, the lock and PID files, and database journals are all excluded.

**The wallet is preserved.** That is the whole point of the exclusion list being written the way it is — the chain is tens of gigabytes and fully re-syncable, while `liquidv1/wallets/` is small and is not recoverable from anywhere else.

So a backup is the configuration and the wallet, and **a restored instance re-syncs from scratch** — days on Liquid. Anything depending on this node is unusable until it catches up. The cookie is excluded because it is regenerated on every run; restoring a stale one would be worse than useless.

## Limitations and Differences

1. **The chain is not backed up**, by design. A restore means a full re-sync.
2. **Liquid mainnet only.** The chain is pinned in the configuration and repaired if changed.
3. **Peg-in validation is off**, which is what lets the node run without a Bitcoin node beside it.
4. **Pruning is effectively one-way.** Lowering it discards blocks immediately; undoing it requires a re-sync.
5. **The transaction index is off by default**, and unavailable on small disks.
6. **The RPC binds to all interfaces and allows any source** inside the container; reachability is StartOS's decision.
7. **Disk is the real constraint** — tens of GB a year, accelerating — and the service will fail its own health check rather than risk corruption when space runs out.

---

## Quick Reference for AI Consumers

```yaml
package_id: elements # note: the title is "Elements (Liquid)"
image: built from ./Dockerfile # upstream version pinned as a build arg
architectures:
  - x86_64
  - aarch64
subcontainers:
  - elements-sub
volumes:
  main: /root/.elements # chain under liquidv1/
file_models:
  - elements.conf
  - store.json
startos_managed_env_vars: [] # configuration is written into elements.conf
dependencies: []
interfaces:
  rpc: { type: api, port: 7041 }
  peer: { type: p2p, port: 7042 }
actions:
  - config
  - runtime-info # only-running
tasks: []
health_checks:
  - elementsd # displayed "RPC"; gate dependents on this, not on sync
  - sync-progress # displayed "Liquid Sync"
  - disk-space # displayed "Disk Space"; fails the service when nearly full
```
