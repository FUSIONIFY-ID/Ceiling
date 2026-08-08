# Hackathon Submission Checklist

## Repository

- [x] Public repository
- [x] Fresh Blitz code only
- [x] README complete
- [x] No secrets committed
- [x] Clean Git status
- [x] Meaningful commit history

## Monad

- [x] Contract deployed during event
- [x] Monad Testnet contract address recorded
- [x] Contract explorer link prepared
- [x] Real contract transaction evidence prepared

## Application

- [x] Web deployment
- [x] Demo URL
- [x] Core CLI demo works
- [x] Payment-blocked fallback demo prepared

## Submission

- [x] Project name: Ceiling
- [x] Category: Infrastructure
- [x] Short description finalized
- [x] Repository URL: <https://github.com/FUSIONIFY-ID/Ceiling>
- [x] Deployment URL
- [x] Contract address: `0xbd06bb4d0a50f84fec7dcd3a916605ff662e7d61`
- [ ] Demo rehearsed under three minutes

Only mark deployment, payment, refund, or transaction items complete after verifying real Monad Testnet evidence.

## Final Submission Data

**Project:** Ceiling

**Team:** Fusionify

**Category:** Infrastructure

**One-liner:** Ceiling commits pricing and acceptance rules before output exists, meters only output that satisfies them, and produces a bill anyone can independently recompute.

**Short description:** Ceiling is metered API billing infrastructure for machine-generated output. It precommits the unit definition, deterministic validator, unit price, maximum usage, and failure policy before processing begins. Published output can then be independently revalidated to reproduce the accepted-unit count and bill, while a Monad Testnet registry records the committed policy and final arithmetic outcome.

**Problem:** Traditional usage billing asks buyers to trust a vendor-controlled unit, meter, and invoice. When generated output is malformed or unusable, the buyer often cannot independently verify what counted or why.

**Solution:** Ceiling precommits billing and acceptance policy, validates output sequentially, and cuts the stream on the first invalid unit. It publishes the output and metadata required to recompute the accepted units and final amount independently.

**Why Monad:** A single Ceiling session does not require Monad and could run on many chains. Monad is useful when many independent machine-payment sessions commit and finalize billing metadata concurrently, where fast execution and low transaction costs make per-session accounting practical.

**Repository:** <https://github.com/FUSIONIFY-ID/Ceiling>

**Demo:** <https://ceiling.fusionify.biz.id>

**Contract:** <https://testnet.monadscan.com/address/0xbd06bb4d0a50f84fec7dcd3a916605ff662e7d61>

**Deployment tx:** <https://testnet.monadscan.com/tx/0x81926658e403c0db914f08a2cfb4779b5634363809701feaa982653cb94bd408>

**Commit tx:** <https://testnet.monadscan.com/tx/0x19aa15f6021deb6c368bed2fecb63bb1e07ab69fbaaad1f9a113a82b609b2c51>

**Outcome tx:** <https://testnet.monadscan.com/tx/0xa6b47e9695d056ce07b4478e29af3c34550c8100b753df7b475c4c2f9cbc9227>
