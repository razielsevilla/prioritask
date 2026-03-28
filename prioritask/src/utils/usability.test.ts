import { describe, it, expect } from 'vitest';
import { evaluateAddPrioritizeFlow } from './usability';

describe('Usability Validation', () => {
  it('passes when flow is under 30 seconds', () => {
    const result = evaluateAddPrioritizeFlow(22500);
    expect(result.passed).toBe(true);
    expect(result.seconds).toBe(22.5);
  });

  it('passes when flow is exactly 30 seconds', () => {
    const result = evaluateAddPrioritizeFlow(30000);
    expect(result.passed).toBe(true);
    expect(result.seconds).toBe(30);
  });

  it('fails when flow exceeds 30 seconds', () => {
    const result = evaluateAddPrioritizeFlow(41200);
    expect(result.passed).toBe(false);
    expect(result.seconds).toBe(41.2);
  });
});
