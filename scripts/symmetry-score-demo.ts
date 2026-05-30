/**
 * Demo: Symmetry Score calculation with dummy data
 * Run: npx ts-node scripts/symmetry-score-demo.ts
 */

const SYMMETRY_IDEAL_RATIOS: Record<number, number> = {
  1: 1.0,   // Bench (anchor)
  2: 0.65,  // Overhead Press
  3: 1.0,   // Pull Up
  4: 1.0,   // Barbell Row
};

function brzycki1RM(weight: number, reps: number): number {
  if (!weight || !reps || reps < 1) return 0;
  if (reps >= 37) return weight;
  return weight * (36 / (37 - reps));
}

function calcSymmetryScore(rms: Record<number, number>, default1RM: number): number {
  const bench = rms[1] > 0 ? rms[1] : default1RM;
  if (bench <= 0) return 0;
  let totalPenalty = 0;
  const slotNames = ['', 'Bench', 'OHP', 'Pull Up', 'Row'];
  console.log('\n  Slot-by-slot deviation:');
  for (const [slot, ratio] of Object.entries(SYMMETRY_IDEAL_RATIOS)) {
    const s = parseInt(slot, 10);
    if (s === 1) continue;
    const actual = rms[s] > 0 ? rms[s] : default1RM;
    const ideal = bench * ratio;
    if (ideal <= 0) continue;
    const deviationPct = Math.abs(actual - ideal) / ideal * 100;
    totalPenalty += deviationPct;
    console.log(`    ${slotNames[s]}: actual=${actual.toFixed(1)}kg, ideal=${ideal.toFixed(1)}kg → deviation ${deviationPct.toFixed(1)}%`);
  }
  const score = Math.max(0, Math.min(1, 1 - totalPenalty / 100));
  console.log(`  Total penalty: ${totalPenalty.toFixed(1)}%`);
  return score;
}

// Dummy data
const bodyWeightKg = 80;
const default1RM = bodyWeightKg * 0.25; // 20 kg

console.log('=== Symmetry Score Demo ===');
console.log(`Body weight: ${bodyWeightKg} kg`);
console.log(`Default 1RM (when no data): ${default1RM} kg`);

// Scenario 1: No data at all - all use default
console.log('\n--- Scenario 1: No data (all use 0.25 × body weight) ---');
const rms1 = { 1: 0, 2: 0, 3: 0, 4: 0 };
const score1 = calcSymmetryScore(rms1, default1RM);
console.log(`Symmetry Score: ${(score1 * 100).toFixed(1)}%`);

// Scenario 2: Only Bench logged (80kg) - others use default 20kg
console.log('\n--- Scenario 2: Only Bench Press logged (80kg × 5 reps → 1RM ~92kg) ---');
const bench1RM = brzycki1RM(80, 5);
const rms2 = { 1: bench1RM, 2: 0, 3: 0, 4: 0 };
const score2 = calcSymmetryScore(rms2, default1RM);
console.log(`Bench est. 1RM: ${bench1RM.toFixed(1)} kg`);
console.log(`Symmetry Score: ${(score2 * 100).toFixed(1)}%`);

// Scenario 3: All four exercises logged with balanced ratios
console.log('\n--- Scenario 3: Balanced data (ideal ratios) ---');
const rms3 = {
  1: 100,   // Bench
  2: 65,    // OHP (65% of bench) ✓
  3: 100,   // Pull Up (100% of bench) ✓
  4: 100,   // Row (100% of bench) ✓
};
const score3 = calcSymmetryScore(rms3, default1RM);
console.log(`Symmetry Score: ${(score3 * 100).toFixed(1)}%`);

// Scenario 4: Slight imbalance
console.log('\n--- Scenario 4: Slight imbalance ---');
const rms4 = {
  1: 100,
  2: 60,    // OHP ideal=65, off by 5
  3: 95,    // Pull ideal=100, off by 5
  4: 105,   // Row ideal=100, off by 5
};
const score4 = calcSymmetryScore(rms4, default1RM);
console.log(`Symmetry Score: ${(score4 * 100).toFixed(1)}%`);

// Scenario 5: Realistic new user - some data
console.log('\n--- Scenario 5: New user - Bench 60kg, OHP 40kg, no Pull/Row ---');
const rms5 = {
  1: 60,
  2: 40,
  3: 0,
  4: 0,
};
const score5 = calcSymmetryScore(rms5, default1RM);
console.log(`Symmetry Score: ${(score5 * 100).toFixed(1)}%`);

console.log('\n=== Summary ===');
console.log('Score is 0 when total penalty ≥ 100%. This happens when you have Bench data');
console.log('but OHP/Pull/Row use default (0.25×body) - the gap from ideal is huge.');
console.log('Log at least some sets for all 4 exercise groups to get a non-zero score.');
