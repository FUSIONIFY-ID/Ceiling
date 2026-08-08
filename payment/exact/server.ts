import { HTTPFacilitatorClient } from "@x402/core/server";
import {
  paymentMiddleware,
  x402ResourceServer,
} from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import express from "express";
import { privateKeyToAccount } from "viem/accounts";

import { requiredPayToPrivateKey } from "../config.js";
import { refundUnusedUsdc } from "../refund/refund.js";
import { createSessionArtifact } from "../../src/core/artifact.js";
import { meterRecords } from "../../src/core/meter.js";
import { DEFAULT_POLICY } from "../../src/core/policy.js";
import { produceRecords } from "../../src/core/producer.js";
import {
  FACILITATOR_URL,
  MONAD_NETWORK,
  USDC_ADDRESS,
  requiredAddress,
} from "../../spike/config.js";

const app = express();
const payTo = requiredAddress("PAY_TO_ADDRESS");
const payToSigner = privateKeyToAccount(requiredPayToPrivateKey());
if (payToSigner.address.toLowerCase() !== payTo.toLowerCase()) {
  throw new Error("PAY_TO_MISMATCH: PAY_TO_PRIVATE_KEY bukan milik PAY_TO_ADDRESS");
}
const scheme = new ExactEvmScheme().registerMoneyParser(
  async (amount, network) =>
    network === MONAD_NETWORK
      ? {
          amount: Math.round(amount * 1_000_000).toString(),
          asset: USDC_ADDRESS,
          extra: { name: "USDC", version: "2" },
        }
      : null,
);
const resourceServer = new x402ResourceServer(
  new HTTPFacilitatorClient({ url: FACILITATOR_URL }),
).register(MONAD_NETWORK, scheme);

resourceServer.onAfterSettle(async ({ result }) => {
  if (!result.success || !result.payer) return;
  const output = produceRecords("ceiling-boomerang-v1", DEFAULT_POLICY.maxUnits);
  const unusedAmount = meterRecords(DEFAULT_POLICY, output).unusedAmount;
  try {
    const refundTransaction = await refundUnusedUsdc(
      result.payer as `0x${string}`,
      unusedAmount,
    );
    console.log("CEILING_PAYMENT_TX", result.transaction);
    console.log("CEILING_REFUND_TX", refundTransaction ?? "NO_REFUND_DUE");
  } catch (error) {
    console.error("REFUND_FAILED", error);
  }
});

app.use(
  paymentMiddleware(
    {
      "GET /boomerang": {
        accepts: {
          scheme: "exact",
          price: "$0.050",
          network: MONAD_NETWORK,
          payTo,
          maxTimeoutSeconds: 300,
        },
        description: "CEILING Boomerang exact charge with unused-amount refund",
        mimeType: "application/json",
      },
    },
    resourceServer,
  ),
);

app.get("/boomerang", (_request, response) => {
  const seed = "ceiling-boomerang-v1";
  const output = produceRecords(seed, DEFAULT_POLICY.maxUnits);
  response.json(createSessionArtifact(seed, DEFAULT_POLICY, output));
});

app.listen(4022, () => {
  console.log("CEILING Boomerang: http://localhost:4022/boomerang");
});
