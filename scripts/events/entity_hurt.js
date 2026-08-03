import { world } from "@minecraft/server";
import { EntityManager } from "../managers/entity_manager";

world.afterEvents.entityHurt.subscribe((event) => {
  EntityManager.showInfoTag(event.hurtEntity);
});
