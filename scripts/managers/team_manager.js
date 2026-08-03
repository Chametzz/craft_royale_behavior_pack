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
    if (!teams || teams.length === 0) return;

    const unassignedPlayers = players.filter(
      (player) => this.getTeamFromEntity(player) === undefined,
    );

    if (unassignedPlayers.length === 0) return;

    for (let i = unassignedPlayers.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      [unassignedPlayers[i], unassignedPlayers[randomIndex]] = [
        unassignedPlayers[randomIndex],
        unassignedPlayers[i],
      ];
    }
  }
}
