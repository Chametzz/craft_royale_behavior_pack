import { system, world } from "@minecraft/server";
import { MatchManager } from "../managers/match_manager.js";
import { TeamManager } from "../managers/team_manager.js";
import { Team } from "../classes/team.js";

let match;

system.afterEvents.scriptEventReceive.subscribe((event) => {
  if (event.id == "craft_royale:start_match") {
    const rawMessage = event.message.trim();

    // 1. Buscamos el primer carácter '{' que indica el inicio del payload JSON
    const jsonStartIndex = rawMessage.indexOf("{");

    if (jsonStartIndex === -1) {
      world.sendMessage("Error: Formato de mensaje inválido (falta el JSON).");
      return;
    }

    // 2. Extraemos el nombre y limpiamos comillas sobrantes o espacios en los bordes
    let playerName = rawMessage.slice(0, jsonStartIndex).trim();

    // Si el nombre viene envuelto en comillas dobles '"Nombre Con Espacios"', se las quitamos
    if (playerName.startsWith('"') && playerName.endsWith('"')) {
      playerName = playerName.slice(1, -1);
    }

    const jsonPayload = rawMessage.slice(jsonStartIndex);

    // 3. Búsqueda insensible a mayúsculas/minúsculas para evitar fallos de tipeo
    const player = world
      .getAllPlayers()
      .find((p) => p.name.toLowerCase() === playerName.toLowerCase());

    if (player) {
      MatchManager.startMatch(player, jsonPayload);
    } else {
      world.sendMessage(
        `No se reconoce el jugador "${playerName}". Verifica que esté en el servidor.`,
      );
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
