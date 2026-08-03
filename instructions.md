# Elements (Liquid)

Before you start it: this node syncs the whole Liquid sidechain, which is well
over 80 GB and growing by tens of GB a year. Read "Managing disk use" below and
decide on pruning before the initial sync fills your disk.

## Documentation

- [Liquid developer documentation](https://docs.liquid.net/) — what Liquid is
  and how its assets, confidential transactions, and RPC work.
- [Elements Core repository](https://github.com/ElementsProject/elements) — the
  daemon this package runs, and its full RPC reference.

## What you get on StartOS

- A standalone **Liquid full node**. It does not need a Bitcoin node alongside
  it: peg-in validation is off, which is the right mode for wallet and swap use.
- A **JSON-RPC interface** that other StartOS services connect to. PeerSwap is
  the first consumer, but any service needing Liquid can use it.
- A **Liquid wallet named `peerswap`**, created for you on first run.
- A **peer interface** for inbound connections from other Liquid nodes.

There is no web interface. Elements is a backend — you will interact with it
through the services that depend on it, and through its Actions.

## Getting set up

1. Start the service. It begins downloading and validating the Liquid
   sidechain immediately.
2. Watch the **Liquid Sync** health check for progress. Expect the initial sync
   to run for hours, and longer on low-power hardware.
3. Once sync completes you will get a "Sync Complete" notification. Services
   that depend on Elements can connect before then — they only need the RPC to
   answer — but Liquid balances and transactions are not trustworthy until the
   node is fully synced.

## Managing disk use

Run the **Configuration** action before or during the initial sync.

- **Pruning** caps how much block data is kept. On a small disk the package
  already defaults to a pruned target; on a large one it defaults to keeping
  everything. Pruning does not limit what PeerSwap or similar services can do —
  they only ever read about an hour of recent blocks.
- **Transaction Index** is off by default. Turn it on only if you have some
  other tool that needs to look up arbitrary Liquid transactions by id; it costs
  several more GB and cannot be combined with pruning.
- **Database Cache** trades RAM for sync speed.

Lowering the prune target on an already-synced node discards blocks straight
away. Raising it, or going back to keeping everything, means re-syncing from
scratch.

The **Disk Space** health check watches free space for you. It notifies you when
space gets low and turns red before the node runs the disk out, because
`elementsd` can corrupt its chain data if that happens.

## Using Elements

### Actions

- **Configuration** — pruning, transaction index, database cache, RPC threads,
  RPC work queue, and maximum peer connections.
- **Runtime & Connection Info** — current block height, sync progress, peer
  count, and the RPC details a dependent service uses.

### Connecting another service

Install the service that needs Liquid and start it; StartOS wires the dependency
up. **Runtime & Connection Info** shows the connection details if you need to
configure something by hand.

## Limitations

- This is a **Liquid mainnet** node only. It cannot run Bitcoin mainnet,
  testnet, or Liquid testnet.
- Peg-in transactions are **not validated** against the Bitcoin chain. That is
  the deliberate trade that lets this run without a Bitcoin node; if you need
  validated peg-ins, this package is not the right tool.
