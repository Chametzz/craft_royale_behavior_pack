import { world } from "@minecraft/server";
import { PlayerManager } from "../managers/player_manager";

world.afterEvents.playerSpawn.subscribe((event) => {
  const { player, initialSpawn } = event;
  if (initialSpawn) {
    player.teleport(world.getDefaultSpawnLocation());
    for (const tag of player.getTags()) {
      player.removeTag(tag);
    }
    PlayerManager.restorePlayer(player);
  }
});
