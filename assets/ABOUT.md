# Elements (Liquid)

Elements Core (`elementsd`) packaged for StartOS as a **Liquid mainnet
(`liquidv1`) full node**.

Liquid is a Bitcoin sidechain operated by a federation. It enables fast
(1-minute blocks), confidential transfers of Bitcoin as **L-BTC**, and the
issuance of other digital assets. Because Liquid is a federated sidechain, this
package syncs and validates the **Liquid** chain — not the Bitcoin mainnet
chain.

## What this package is for

This package exists to provide **Liquid (L-BTC) RPC functionality to other
StartOS services**. Its primary consumer is **PeerSwap**, which uses an
`elementsd` RPC backend to perform Liquid submarine swaps. Any StartOS app that
needs a Liquid node can depend on it.

It exposes:

- A **JSON-RPC interface**, which dependent packages resolve over the StartOS
  internal bridge rather than by hostname.
- A **`peerswap` wallet**, pre-created on first run.
- An **RPC cookie** that dependent packages mount read-only and read.

## Standalone Liquid node (no peg-in validation)

This package runs with `validatepegin=0`, meaning it does **not** run an
embedded Bitcoin Core to validate Liquid peg-ins against the Bitcoin chain. It
therefore needs no synced Bitcoin node alongside it, while still running a full,
validating Liquid node. This is the correct mode for swap and wallet use cases
such as PeerSwap.

## Disk

The Liquid sidechain is well past 80 GB and growing by tens of GB a year.
Pruning is available from the Configuration action and is the default on hosts
whose disk cannot hold an archival node; a `Disk Space` health check warns
before free space runs out.
