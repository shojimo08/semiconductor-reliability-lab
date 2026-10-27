/** Small deterministic 32-bit PRNG. Same seed produces the same stream. */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let value = Math.imul(state ^ (state >>> 15), 1 | state)
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296
  }
}

/** Generate unit exponential factors once. U is shifted to the open interval (0, 1). */
export function sampleUnitExponentials(count: number, seed: number): number[] {
  if (!Number.isInteger(count) || count < 1) throw new RangeError('count must be a positive integer')
  if (!Number.isInteger(seed)) throw new RangeError('seed must be an integer')
  const random = mulberry32(seed)
  return Array.from({ length: count }, () => {
    const u = (random() * 4_294_967_294 + 1) / 4_294_967_296
    return -Math.log1p(-u)
  })
}
