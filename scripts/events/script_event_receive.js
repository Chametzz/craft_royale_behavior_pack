import { system, world } from "@minecraft/server";
import { MatchManager } from "../managers/match_manager.js";
import { TeamManager } from "../managers/team_manager.js";
import { Team } from "../classes/team.js";

let match;

system.afterEvents.scriptEventReceive.subscribe((event) => {
  if (event.id == "craft_royale:start_match") {
    const rawMessage = event.message.trim();

    const jsonStartIndex = rawMessage.indexOf("{");

    if (jsonStartIndex === -1) {
      return;
    }

    let playerName = rawMessage.slice(0, jsonStartIndex).trim();

    if (playerName.startsWith('"') && playerName.endsWith('"')) {
      playerName = playerName.slice(1, -1);
    }

    const jsonPayload = rawMessage.slice(jsonStartIndex);

    const player = world
      .getAllPlayers()
      .find((p) => p.name.toLowerCase() === playerName.toLowerCase());

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
  } else if (event.id == "craft_royale:remove_teams") {
    const player = world
      .getAllPlayers()
      .find((p) => p.name == event.message.trim());
    TeamManager.removeTeamsFromEntity(player, Team.red);
    player.onScreenDisplay.setTitle("No Team");
  }
});
