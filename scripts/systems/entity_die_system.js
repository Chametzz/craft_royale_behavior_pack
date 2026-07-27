import { world, EntityTypes } from "@minecraft/server";
import { MatchManager } from "../managers/match_manager";

world.afterEvents.entityDie.subscribe((event) => {
  const deadEntity = event.deadEntity;
  const typeId = deadEntity.typeId;

  if (typeId === "minecraft:slime" || typeId === "minecraft:magma_cube") {
    const tags = deadEntity.getTags();

    if (tags.length === 0) return;
    const dimension = deadEntity.dimension;
    const location = deadEntity.location;

    const children = dimension.getEntities({
      location: location,
      maxDistance: 2.5,
      type: typeId,
    });

    for (const child of children) {
      for (const tag of tags) {
        if (!child.hasTag(tag)) {
          child.addTag(tag);
        }
      }
    }
  }
});

world.afterEvents.entityHurt.subscribe((event) => {
  MatchManager.showHealthEntity(event.hurtEntity);
});
