# Security and Limitations

- Use dedicated burner wallets for Monad Testnet.
- Never commit `PRIVATE_KEY`, `PAY_TO_PRIVATE_KEY`, seed phrases, or API credentials.
- `.env.local` must remain ignored by Git.
- `PAY_TO_PRIVATE_KEY` is required only for the live refund path and must correspond to `PAY_TO_ADDRESS`.
- Testnet assets have no real monetary value, but exposed keys can still be abused and should be rotated.
- Review Permit2 approval scope before signing. The current helper grants the canonical Permit2 contract a maximum token allowance.
- Do not use a primary or mainnet wallet private key.
- The deterministic validator proves compliance with declared field rules; it does not prove semantic truth or universal output quality.
- `CeilingRegistry` enforces session ownership, unit bounds, and billing arithmetic. It does not inspect output.
- Independent recomputation requires the canonical policy and published output artifact to remain available.
- The exact/refund fallback has two on-chain operations. A failed refund leaves the ceiling charge in place and must be surfaced rather than hidden.
