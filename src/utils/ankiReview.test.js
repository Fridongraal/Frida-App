import { describe, it, expect } from 'vitest';
import { applyStudyAction, normalizeAlgorithm, ANKI_CONFIG } from './fridaReview';

describe('Anki Review Engine', () => {
  it('should handle new cards: Again keeps card in learning step 0', () => {
    const card = { algorithm: { state: 'new', easeFactor: 2500, interval: 0, repetitions: 0 } };
    const outcome = applyStudyAction(card, 1);
    expect(outcome.sessionAlgorithm.state).toBe('learning');
    expect(outcome.sessionAlgorithm.learningStep).toBe(0);
    expect(outcome.requeueMode).toBe('short');
  });

  it('should handle new cards: Good advances step, then graduates on last step', () => {
    const card = { algorithm: { state: 'new', easeFactor: 2500, interval: 0, repetitions: 0 } };
    
    // Step 0 -> Step 1 (10m)
    const step1 = applyStudyAction(card, 2);
    expect(step1.sessionAlgorithm.state).toBe('learning');
    expect(step1.sessionAlgorithm.learningStep).toBe(1);
    expect(step1.requeueMode).toBe('end');

    // Step 1 -> Graduation (Review, 1d)
    const graduated = applyStudyAction(step1.sessionAlgorithm, 2);
    expect(graduated.sessionAlgorithm.state).toBe('review');
    expect(graduated.sessionAlgorithm.interval).toBeGreaterThanOrEqual(1);
    expect(graduated.requeueMode).toBe('none');
  });

  it('should handle new cards: Easy graduates immediately with 4d interval', () => {
    const card = { algorithm: { state: 'new', easeFactor: 2500, interval: 0, repetitions: 0 } };
    const outcome = applyStudyAction(card, 3);
    expect(outcome.sessionAlgorithm.state).toBe('review');
    expect(outcome.sessionAlgorithm.interval).toBeGreaterThanOrEqual(4);
    expect(outcome.requeueMode).toBe('none');
  });

  it('should handle review cards: Again increases lapses, decreases ease, enters relearning', () => {
    const card = { algorithm: { state: 'review', easeFactor: 2500, interval: 10, repetitions: 3, lapses: 0 } };
    const outcome = applyStudyAction(card, 1);
    expect(outcome.sessionAlgorithm.state).toBe('relearning');
    expect(outcome.sessionAlgorithm.lapses).toBe(1);
    expect(outcome.sessionAlgorithm.easeFactor).toBe(2300); // 2500 - 200
    expect(outcome.sessionAlgorithm.interval).toBe(10); // preserves interval
    expect(outcome.requeueMode).toBe('short');
  });

  it('should handle review cards: Good scales interval by easeFactor and keeps easeFactor', () => {
    const card = { algorithm: { state: 'review', easeFactor: 2500, interval: 10, repetitions: 3 } };
    const outcome = applyStudyAction(card, 2);
    expect(outcome.sessionAlgorithm.state).toBe('review');
    expect(outcome.sessionAlgorithm.easeFactor).toBe(2500);
    // 10 * 2.5 = 25 (with ±5% fuzz, ~24-26)
    expect(outcome.sessionAlgorithm.interval).toBeGreaterThanOrEqual(23);
    expect(outcome.sessionAlgorithm.interval).toBeLessThanOrEqual(27);
  });

  it('should handle review cards: Easy scales interval with easyBonus and increases easeFactor by 150', () => {
    const card = { algorithm: { state: 'review', easeFactor: 2500, interval: 10, repetitions: 3 } };
    const outcome = applyStudyAction(card, 3);
    expect(outcome.sessionAlgorithm.state).toBe('review');
    expect(outcome.sessionAlgorithm.easeFactor).toBe(2650); // 2500 + 150
    // 10 * 2.5 * 1.3 = 32.5 -> 33 (with fuzz, ~31-35)
    expect(outcome.sessionAlgorithm.interval).toBeGreaterThanOrEqual(30);
  });

  it('should handle relearning cards: Good graduates back to review with preserved interval', () => {
    const card = { algorithm: { state: 'relearning', easeFactor: 2300, interval: 10, learningStep: 0, lapses: 1 } };
    const outcome = applyStudyAction(card, 2);
    expect(outcome.sessionAlgorithm.state).toBe('review');
    expect(outcome.sessionAlgorithm.interval).toBeGreaterThanOrEqual(9); // recovered around 10d
  });
});
