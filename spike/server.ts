import { HTTPFacilitatorClient } from "@x402/core/server";
import {
  paymentMiddleware,
  setSettlementOverrides,
  x402ResourceServer,
} from "@x402/express";
import { UptoEvmScheme } from "@x402/evm/upto/server";
import express from "express";

import {
  ACTUAL_AMOUNT,
  FACILITATOR_URL,
  MAX_AMOUNT,
  MONAD_NETWORK,
  USDC_ADDRESS,
  requiredAddress,
} from "./config.js";

const app = express();
const payTo = requiredAddress("PAY_TO_ADDRESS");
const facilitator = new HTTPFacilitatorClient({ url: FACILITATOR_URL });
const scheme = new UptoEvmScheme();

scheme.registerMoneyParser(async (price, network) => {
  if (network !== MONAD_NETWORK) return null;
  if (!Number.isFinite(price) || price < 0) return null;
  return {
    amount: Math.round(price * 1_000_000).toString(),
    asset: USDC_ADDRESS,
    extra: { name: "USDC", version: "2" },
  };
});

const resourceServer = new x402ResourceServer(facilitator).register(
  MONAD_NETWORK,
  scheme,
);

app.use(
  paymentMiddleware(
    {
      "GET /metered": {
        accepts: {
          scheme: "upto",
          price: "$0.050",
          network: MONAD_NETWORK,
          payTo,
          maxTimeoutSeconds: 300,
        },
        description: "CEILING deterministic metered output spike",
        mimeType: "application/json",
        settlementFailedResponseBody: (_context, result) => ({
          contentType: "application/json",
          body: {
            code: "SETTLEMENT_REJECTED",
            evidence: result,
            likelyCause: "Facilitator, allowance, signature, atau saldo menolak settlement",
            nextAction: "Jalankan npm run spike:approve lalu coba ulang",
          },
        }),
      },
    },
    resourceServer,
  ),
);

app.get("/metered", (_req, res) => {
  setSettlementOverrides(res, { amount: ACTUAL_AMOUNT });
  res.json({
    product: "CEILING",
    authorizedMaxAtomic: MAX_AMOUNT,
    actualSettlementAtomic: ACTUAL_AMOUNT,
    output: [{ unit: 1, accepted: true }],
  });
});

app.listen(4021, () => {
  console.log("CEILING x402 upto server: http://localhost:4021/metered");
  console.log(`Authorized maximum: ${MAX_AMOUNT} atomic USDC`);
  console.log(`Actual settlement:  ${ACTUAL_AMOUNT} atomic USDC`);
});
