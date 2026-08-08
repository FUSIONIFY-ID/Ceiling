## Learned User Preferences
- Keep CEILING’s product identity and scope focused; do not rename it, reuse unrelated project code/assets, or add unrelated features.
- Before pushing, verify commit author, committer, message trailers, and GitHub attribution contain no Cursor/agent identity.
- Keep secret and local environment files out of Git; review staged files before every commit or push.

## Learned Workspace Facts
- CEILING is a metered API billing developer tool whose core flow precommits policy, deterministically validates and meters output, settles actual accepted usage, publishes an artifact, and supports bill recomputation.
- The repository targets Monad Testnet (`eip155:10143`) and pins the x402 packages, including `@x402/evm`, to `2.12.0`.
- The original x402 `upto` spike is retained under `spike/`; the fallback “CEILING Boomerang” path uses x402 `exact` charging plus an unused-USDC refund.
- Core deterministic logic lives under `src/core/`; `npm run test:core`, `npm run demo:core`, `npm run contract:compile`, and `npm run check` are the primary local verification commands.
- `contracts/CeilingRegistry.sol` is a non-escrow registry that enforces commit-once, creator-only single finalization, `acceptedUnits <= maxUnits`, and `settledAmount == acceptedUnits * unitPrice`.
