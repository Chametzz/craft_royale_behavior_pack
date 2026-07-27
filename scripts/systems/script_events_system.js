import { system, world, Entity } from "@minecraft/server";
import { MatchManager } from "../managers/match_manager";

system.afterEvents.scriptEventReceive.subscribe((event) => {
  if (event.id == "craft_royale:add_blue_team") {
    const player = world
      .getAllPlayers()
      .find((p) => p.name == event.message.trim());
    const tags = player.getTags();
    for (const tag of tags) {
      player.removeTag(tag);
    }
    player.addTag("blue_team");
    player.runCommand("title @s title §9Team Blue");
  }
  if (event.id == "craft_royale:add_red_team") {
    const player = world
      .getAllPlayers()
      .find((p) => p.name == event.message.trim());
    const tags = player.getTags();
    for (const tag of tags) {
      player.removeTag(tag);
    }
    player.addTag("red_team");
    player.runCommand("title @s title §cTeam Red");
  }
  if (event.id == "craft_royale:remove_teams") {
    const player = world
      .getAllPlayers()
      .find((p) => p.name == event.message.trim());
    const tags = player.getTags();
    for (const tag of tags) {
      player.removeTag(tag);
    }
    player.runCommand("title @s subtitle No Team");
  }

  if (event.id == "craft_royale:start_match") {
    MatchManager.startWithDelay(event.message);
  }

  if (event.id == "craft_royale:stop_match") {
    MatchManager.stop();
  }
});
