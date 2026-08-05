import { Entity, Player } from "@minecraft/server";
import { Team } from "../classes/team.js";
import { EntityManager } from "./entity_manager.js";

export class TeamManager {
  /**
   *
   * @param {Entity} entity
   */
  static removeTeamsFromEntity(entity) {
    if (entity.getTags().length > 0) {
      for (const team of Team.values) {
        if (entity.hasTag(team.key)) {
          entity.removeTag(team.key);
        }
      }
    }
  }

  /**
   *
   * @param {Entity} entity
   * @param {Team} team
   */
  static addEntityToTeam(entity, team) {
    this.removeTeamsFromEntity(entity);
    entity.addTag(team.key);
    if (entity instanceof Player) {
      entity.onScreenDisplay.setTitle(`${team.color}${team.name}`);
    }
    EntityManager.showInfoTag(entity);
  }

  /**
   *
   * @param {Entity} entity
   */
  static getTeamFromEntity(entity) {
    for (const team of Team.values) {
      if (entity.hasTag(team.key)) {
        return team;
      }
    }
    return undefined;
  }

  /**
   * @param {Player[]} players
   * @param {Team[]} teams
   */
  static assignTeams(players, teams) {
    if (!teams || teams.length === 0 || !players || players.length === 0)
      return;

    // 1. Filtrar jugadores sin equipo
    const unassignedPlayers = players.filter(
      (player) => this.getTeamFromEntity(player) === undefined,
    );

    if (unassignedPlayers.length === 0) return;

    // 2. Mezclar aleatoriamente a los jugadores sin equipo (Fisher-Yates Shuffle)
    for (let i = unassignedPlayers.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      [unassignedPlayers[i], unassignedPlayers[randomIndex]] = [
        unassignedPlayers[randomIndex],
        unassignedPlayers[i],
      ];
    }

    // 3. Contar cuántos jugadores tiene ya cada equipo para mantener balance
    const teamCounts = teams.map((team) => ({
      team: team,
      count: players.filter((p) => this.getTeamFromEntity(p)?.key === team.key)
        .length,
    }));

    // 4. Asignar a cada jugador sin equipo al que menos miembros tenga en ese momento
    for (const player of unassignedPlayers) {
      // Ordenar de menor a mayor cantidad de integrantes
      teamCounts.sort((a, b) => a.count - b.count);

      // Elegir el equipo más vacío
      const targetTeamObj = teamCounts[0];

      // Asignar el equipo al jugador
      this.addEntityToTeam(player, targetTeamObj.team);

      // Incrementar el contador local
      targetTeamObj.count++;
    }
  }
}
