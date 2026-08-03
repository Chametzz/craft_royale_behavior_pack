import { system, world } from "@minecraft/server";
import { MatchManager } from "../managers/match_manager.js";
import { TeamManager } from "../managers/team_manager.js";
import { Team } from "../classes/team.js";

let match;

system.afterEvents.scriptEventReceive.subscribe((event) => {
  if (event.id == "craft_royale:start_match") {
    const rawMessage = event.message.trim();
    const spaceIndex = rawMessage.indexOf(" ");

    if (spaceIndex === -1) return;

    const playerName = rawMessage.slice(0, spaceIndex);
    const jsonPayload = rawMessage.slice(spaceIndex + 1);

    const player = world.getAllPlayers().find((p) => p.name === playerName);

    if (player) {
      MatchManager.startMatch(player, jsonPayload);
    }
  } else if (event.id == "craft_royale:stop_match") {
    MatchManager.stopMatch();
  } else if (event.id == "craft_royale:add_blue_team") {
    const player = world
      .getAllPlayers()
      .find((p) => p.name == event.message.trim());
    TeamManager.addEntityToTeam(player, Team.blue);
  } else if (event.id == "craft_royale:add_red_team") {
    const player = world
      .getAllPlayers()
      .find((p) => p.name == event.message.trim());
    TeamManager.addEntityToTeam(player, Team.red);
  }
});
