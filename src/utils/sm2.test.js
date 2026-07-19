import { describe, it, expect } from 'vitest';
import { calculateSM2 } from './sm2';

describe('calculateSM2', () => {
  it('should reset repetitions and interval to 1 when quality is 1 (Difficult)', () => {
    const result = calculateSM2(1, 4, 2.5, 2);
    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(1);
    expect(result.easeFactor).toBeLessThan(2.5); // Ease factor should decrease
  });

  it('should increment repetitions and calculate correct interval when quality is 2 (Good)', () => {
    // First successful review (repetitions from 0 -> 1)
    const result1 = calculateSM2(2, 1, 2.5, 0);
    expect(result1.repetitions).toBe(1);
    expect(result1.interval).toBe(1);

    // Second successful review (repetitions from 1 -> 2)
    const result2 = calculateSM2(2, 1, 2.5, 1);
    expect(result2.repetitions).toBe(2);
    expect(result2.interval).toBe(4); // our custom MVP scale has interval = 4 for repetitions = 1
  });

  it('should increase ease factor and repetitions when quality is 3 (Easy)', () => {
    const result = calculateSM2(3, 4, 2.5, 2);
    expect(result.repetitions).toBe(3);
    expect(result.easeFactor).toBeGreaterThan(2.5);
  });
});
