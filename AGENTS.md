# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

Work this package's `TODO.md` from top to bottom. Keep `README.md` (technical reference for an AI support or administering agent) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **`rpcHostId` / `rpcPort` and the cookie path are a cross-package contract.** `peerswap` and anything else consuming this node resolve it from those exports; changing either breaks them silently. The contract is written out in `README.md` § Dependencies.
- **The disk-aware defaults are not decoration.** The Liquid chain is past 80 GB and growing tens of GB a year, which is why `txindex` defaults off, `prune` is disk-sized and floors at upstream's minimum, and the `disk-space` check fails the service outright below a few GB — elementsd can corrupt chain data if it runs the disk out.
- **`hardwareRequirements.ram` is 3 GiB to mean "4 GB or better".** StartOS compares it against `MemTotal`, which reads a few hundred MiB below the advertised capacity, so a literal 4 GiB rejects every 4 GB machine. Don't "correct" it.
- **The `create-wallet` oneshot must keep passing `load_on_startup=true` on both paths.** It can race a slow start — `loadwallet` times out during IBD — and the pin in elementsd's own settings is what makes the wallet load with the daemon anyway rather than staying silently unloaded.
- **The backup exclusion list is written to keep the wallet.** `liquidv1/wallets/` is small and unrecoverable; blocks, chainstate and indexes are tens of GB and re-syncable. The cookie is excluded because it is regenerated each run and a stale one is worse than none.
- **The low-disk notification is once-per-episode, via a closure flag that resets on recovery.** Don't turn it into a per-poll notification.
