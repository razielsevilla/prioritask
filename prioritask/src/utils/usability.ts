export type FlowValidation = {
  seconds: number;
  passed: boolean;
  message: string;
};

const TARGET_SECONDS = 30;

export const evaluateAddPrioritizeFlow = (durationMs: number): FlowValidation => {
  const safeDuration = Number.isFinite(durationMs) ? Math.max(0, durationMs) : 0;
  const seconds = Number((safeDuration / 1000).toFixed(1));
  const passed = seconds <= TARGET_SECONDS;

  if (passed) {
    return {
      seconds,
      passed,
      message: `Completed in ${seconds}s (target: <= ${TARGET_SECONDS}s).`,
    };
  }

  return {
    seconds,
    passed,
    message: `Completed in ${seconds}s (over ${TARGET_SECONDS}s target).`,
  };
};
