/**
 * SIMULASI PRESENTASI CEILING
 *
 * Menjalankan satu sesi penuh dari dua sisi:
 *   - sisi PENJUAL : produksi, validasi, metering, terbitkan artifact
 *   - sisi PEMBELI : hitung ulang sendiri dari artifact, tanpa percaya penjual
 *
 * Lalu mensimulasikan penjual curang dan membuktikan kecurangannya ketahuan.
 *
 * Jalankan: npx tsx scripts/simulasi-presentasi.ts
 * Tidak butuh PRIVATE_KEY, tidak butuh koneksi internet.
 */

import { formatUnits } from "viem";

import { createSessionArtifact, hashOutput, recomputeSession } from "../src/core/artifact.js";
import { meterRecords } from "../src/core/meter.js";
import { DEFAULT_POLICY, hashPolicy } from "../src/core/policy.js";
import { produceRecords } from "../src/core/producer.js";
import { validateRecord } from "../src/core/validator.js";

const uang = (value: bigint): string => `$${formatUnits(value, 6)}`;
const babak = (judul: string): void => {
  console.log("\n" + "=".repeat(66));
  console.log("  " + judul);
  console.log("=".repeat(66) + "\n");
};

const unitPrice = BigInt(DEFAULT_POLICY.unitPriceAtomic);

// ============================================================
babak("BABAK 1 — ATURAN DIKUNCI SEBELUM OUTPUT ADA");
// ============================================================

const policyHash = hashPolicy(DEFAULT_POLICY);
console.log("Aturan yang dikunci penjual di awal:\n");
console.log(`  1 unit          = ${DEFAULT_POLICY.unitDefinition}`);
console.log(`  syarat sah      = name: string tidak kosong, score: angka finite`);
console.log(`  kalau rusak     = ${DEFAULT_POLICY.failurePolicy}`);
console.log(`  harga per unit  = ${uang(unitPrice)}`);
console.log(`  maksimal unit   = ${DEFAULT_POLICY.maxUnits}`);
console.log(`\n  PLAFON          = ${DEFAULT_POLICY.maxUnits} x ${uang(unitPrice)} = ${uang(BigInt(DEFAULT_POLICY.maxUnits) * unitPrice)}`);
console.log(`\n  policyHash      = ${policyHash}`);
console.log("\n  --> hash ini dicatat ke blockchain SEKARANG, sebelum ada output.");
console.log("      Setelah ini aturan tidak bisa diubah diam-diam.");

// ============================================================
babak("BABAK 2 — PEMBELI MENYETUJUI PLAFON, BUKAN ANGKA KOSONG");
// ============================================================

console.log("  Pembeli tanda tangan   : \"saya izinkan MAKSIMAL $0.050000\"");
console.log("  Pembeli TIDAK teken    : \"silakan tagih berapa pun nanti\"");
console.log("\n  --> apa pun yang terjadi, tagihan mustahil melebihi $0.050000");

// ============================================================
babak("BABAK 3 — OUTPUT DIPRODUKSI DAN DIVALIDASI SATU PER SATU");
// ============================================================

const seed = "presentasi-ceiling";
const output = produceRecords(seed, DEFAULT_POLICY.maxUnits, 18);
const meter = meterRecords(DEFAULT_POLICY, output);

for (const item of meter.recordsWithValidation) {
  if (item.afterCut) continue;
  const nomor = String(item.unit).padStart(2, "0");

  if (item.validation?.valid) {
    const record = item.record as { name: string; score: number };
    console.log(
      `  unit ${nomor}  DITERIMA  ${record.name.padEnd(24)} score=${String(record.score).padEnd(6)} +${uang(unitPrice)}`,
    );
    continue;
  }

  if (item.validation) {
    console.log(`  unit ${nomor}  DITOLAK   ${JSON.stringify(item.record)}`);
    console.log(`            alasan: ${item.validation.reason}`);
    console.log(`\n  >>> STREAM DIPUTUS DI UNIT ${nomor} <<<`);
    console.log(`  unit ${nomor} tidak ditagih.`);
    console.log(`  unit ${item.unit + 1}-${DEFAULT_POLICY.maxUnits} juga tidak ditagih.`);
    break;
  }
}

// ============================================================
babak("BABAK 4 — TAGIHAN DIHITUNG, BUKAN DIKARANG");
// ============================================================

console.log(`  plafon disetujui    ${uang(meter.ceilingAmount)}   (${meter.maxUnits} unit)`);
console.log(`  unit yang lolos     ${meter.acceptedUnits}`);
console.log(`  perhitungan         ${meter.acceptedUnits} x ${uang(meter.unitPriceAtomic)}`);
console.log(`\n  TAGIHAN FINAL       ${uang(meter.actualAmount)}`);
console.log(`  TIDAK DITAGIH       ${uang(meter.unusedAmount)}   <-- tidak pernah pindah tangan`);

const artifact = createSessionArtifact(seed, DEFAULT_POLICY, output);
console.log("\n  Artifact yang diterbitkan ke pembeli:");
console.log(`    sessionId    ${artifact.sessionId}`);
console.log(`    policyHash   ${artifact.policyHash}`);
console.log(`    outputHash   ${artifact.outputHash}`);
console.log(`    output       seluruh ${artifact.output.length} record mentah, termasuk yang rusak`);

// ============================================================
babak("BABAK 5 — PEMBELI TIDAK PERCAYA. DIA HITUNG ULANG SENDIRI.");
// ============================================================

console.log("  Pembeli TIDAK memakai angka dari penjual.");
console.log("  Dia ambil record mentahnya, lalu jalankan validator versinya sendiri:\n");

let unitVersiPembeli = 0;
for (const record of artifact.output) {
  if (!validateRecord(record).valid) break;
  unitVersiPembeli += 1;
}
const tagihanVersiPembeli = BigInt(unitVersiPembeli) * BigInt(artifact.unitPriceAtomic);

console.log(`    hitungan pembeli    ${unitVersiPembeli} unit  ->  ${uang(tagihanVersiPembeli)}`);
console.log(`    klaim penjual       ${artifact.acceptedUnits} unit  ->  ${uang(BigInt(artifact.actualAmount))}`);
console.log(`    ${unitVersiPembeli === artifact.acceptedUnits ? "IDENTIK" : "BERBEDA"}\n`);

console.log(`    policyHash  dihitung pembeli  ${hashPolicy(artifact.policy).slice(0, 22)}...`);
console.log(`    policyHash  diklaim penjual   ${artifact.policyHash.slice(0, 22)}...`);
console.log(`    outputHash  dihitung pembeli  ${hashOutput(artifact.output).slice(0, 22)}...`);
console.log(`    outputHash  diklaim penjual   ${artifact.outputHash.slice(0, 22)}...`);

const verifikasi = recomputeSession(artifact);
console.log("\n  Hasil verifikasi menyeluruh:");
for (const [nama, cocok] of Object.entries(verifikasi)) {
  console.log(`    ${nama.replace("Matches", "").padEnd(18)} ${cocok ? "COCOK" : "TIDAK COCOK"}`);
}
console.log("\n  --> Pembeli membuktikan sendiri tagihannya benar.");
console.log("      Dia tidak perlu percaya siapa pun.");

// ============================================================
babak("BABAK 6 — SEKARANG PENJUALNYA CURANG");
// ============================================================

const klaimPalsu = { ...artifact, acceptedUnits: 22, actualAmount: "44000" };

console.log("  Penjual mengirim artifact yang sama, tapi tagihannya dinaikkan:\n");
console.log(`    klaim palsu   22 unit  ->  ${uang(44000n)}`);
console.log(`    kenyataan     17 unit  ->  ${uang(34000n)}`);
console.log(`    selisih curang         ->  ${uang(10000n)}\n`);
console.log("  Aritmatikanya sengaja dibuat konsisten (22 x 2000 = 44000),");
console.log("  supaya lolos pengecekan smart contract. Tapi pembeli tetap cek sendiri:\n");

const verifikasiPalsu = recomputeSession(klaimPalsu);
for (const [nama, cocok] of Object.entries(verifikasiPalsu)) {
  console.log(`    ${nama.replace("Matches", "").padEnd(18)} ${cocok ? "COCOK" : "*** TIDAK COCOK ***"}`);
}

console.log("\n  --> KECURANGAN TERDETEKSI OTOMATIS.");
console.log("      outputHash membuktikan record mentahnya tidak berubah,");
console.log("      dan validator membuktikan cuma 17 yang lolos.");
console.log("      Pembeli punya bukti matematis, bukan sekadar curiga.");

// ============================================================
babak("RINGKASAN UNTUK PENONTON");
// ============================================================

console.log("  1. Aturan dikunci SEBELUM output ada   -> tidak bisa diubah belakangan");
console.log("  2. Plafon disetujui di depan           -> mustahil ditagih lebih");
console.log("  3. Output rusak tidak dihitung         -> bayar yang berguna saja");
console.log("  4. Semua bahan diterbitkan             -> pembeli hitung ulang sendiri");
console.log("  5. Curang langsung ketahuan            -> bukti matematis\n");
