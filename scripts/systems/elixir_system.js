import { system, world } from "@minecraft/server";
export let elixirMultiplier = 1;
export let elixirIntervalId = null;

/**
 *
 * @param {number} multiplier
 */
export function setElixirMultiplier(multiplier) {
  elixirMultiplier = multiplier;
  const baseTicks = 56;

  const newTicks = Math.floor(baseTicks / multiplier);

  if (elixirIntervalId !== null) {
    system.clearRun(elixirIntervalId);
  }

  elixirIntervalId = system.runInterval(() => {
    const players = world.getAllPlayers();
    for (const p of players) {
      if (p.hasTag("in_match") && p.level < 10) {
        p.addLevels(1);
      }
    }
  }, newTicks);
}

export function stopElixir() {
  if (elixirIntervalId !== null) {
    system.clearRun(elixirIntervalId);
    elixirIntervalId = null;
  }
}
