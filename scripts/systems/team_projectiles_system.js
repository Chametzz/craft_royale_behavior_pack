import { world } from "@minecraft/server";

world.afterEvents.entitySpawn.subscribe((event) => {
  const projectile = event.entity;
  const projectileComponent = projectile.getComponent("minecraft:projectile");

  if (projectile) {
    const shooter = projectile.owner;
    if (shooter) {
      if (shooter.hasTag("blue_team")) {
        projectile.addTag("blue_team");
      }
      if (shooter.hasTag("red_team")) {
        projectile.addTag("red_team");
      }
    }
  }
});
