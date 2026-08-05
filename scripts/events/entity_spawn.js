import { world } from "@minecraft/server";
import { TeamManager } from "../managers/team_manager";

world.afterEvents.entitySpawn.subscribe((event) => {
  const projectile = event.entity;
  const projectileComponent = projectile.getComponent("minecraft:projectile");

  if (projectile) {
    const shooter = projectile.owner;
    if (shooter) {
      const team = TeamManager.getTeamFromEntity(shooter);
      world.sendMessage("soy de este equipo");
      if (team) {
        TeamManager.addEntityToTeam(projectile, team);
      }
    }
  }
});
