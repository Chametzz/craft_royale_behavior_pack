import { world } from "@minecraft/server";
import { TeamManager } from "../managers/team_manager";

world.afterEvents.entitySpawn.subscribe((event) => {
  const entity = event.entity;
  const projectile = entity.getComponent("minecraft:projectile");

  if (entity && entity.isValid) {
    if (projectile && projectile.isValid) {
      const shooter = projectile.owner;
      if (shooter && shooter.isValid) {
        for (const tag of shooter.getTags()) {
          entity.addTag(tag);
        }
      }
    }
  }
});
