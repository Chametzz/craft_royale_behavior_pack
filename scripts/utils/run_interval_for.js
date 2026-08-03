import { system } from "@minecraft/server";

/**
 * @param {(iteration: number) => void} callback
 * @param {number} intervalTicks
 * @param {number} maxRepetitions
 */
export function runIntervalFor(callback, intervalTicks, maxRepetitions) {
  if (maxRepetitions <= 0) return;

  let currentCount = 0;

  const intervalId = system.runInterval(() => {
    currentCount++;

    callback(currentCount);

    if (currentCount >= maxRepetitions) {
      system.clearRun(intervalId);
    }
  }, intervalTicks);

  return intervalId;
}
