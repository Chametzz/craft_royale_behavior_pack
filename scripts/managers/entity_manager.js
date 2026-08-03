import { Entity } from "@minecraft/server";
import { TeamManager } from "./team_manager";

export class EntityManager {
  /**
   *
   * @param {Entity} entity
   */
  static showInfoTag(entity) {
    const health = entity.getComponent("minecraft:health");
    if (health) {
      const currentHealth = Math.max(0, Math.ceil(health.currentValue));
      const maxHealth = Math.ceil(health.effectiveMax);
      const team = TeamManager.getTeamFromEntity(entity);
      let teamTag = "";
      if (team) {
        teamTag = `${team.nameWithColor}\n`;
      }
      entity.nameTag = `${teamTag}:heart: ${currentHealth}/${maxHealth}`;
    }
  }
}
