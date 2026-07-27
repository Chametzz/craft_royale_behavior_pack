import { system, world } from "@minecraft/server";

system.runInterval(() => {
  const players = world.getAllPlayers();
  for (const p of players) {
    const currentElixir = p.level;
    if (p.hasTag("in_match") && currentElixir < 9) {
      p.addLevels(1);
    }
  }
}, 56);
