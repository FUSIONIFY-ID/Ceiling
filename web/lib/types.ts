export type DemoSession = {
  sessionId: string;
  policy: {
    validator: string;
    unitDefinition: string;
    failurePolicy: string;
    unitPriceAtomic: string;
    maxUnits: number;
  };
  policyHash: string;
  records: Array<{
    unit: number;
    record: unknown;
    validation: null | { valid: boolean; reason: null | string };
    billed: boolean;
    afterCut: boolean;
  }>;
  outputHash: string;
  acceptedUnits: number;
  rejectedAt: number | null;
  maxUnits: number;
  unitPriceAtomic: string;
  ceilingAmount: string;
  actualAmount: string;
  unusedAmount: string;
  recomputation: Record<string, boolean>;
  proof: {
    contract: string;
    deploymentTx: string;
    commitTx: string;
    outcomeTx: string;
    readback: "PASS";
  };
  payment: {
    integration: "READY";
    preflight: "PASS";
    liveSettlement: "WAITING FOR TEST USDC";
  };
};
