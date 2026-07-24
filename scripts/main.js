import { system, GameMode, world, Entity } from "@minecraft/server";

export class CraftRoyaleCard {
  /**
   * @param {string} itemId
   * @param {number} elixirCost
   * @param {(target: Vector3, dimension: Dimension) => Entity[]} invokeFn
   */
  constructor(itemId, elixirCost, invoke) {
    /** @type {string} */
    this.itemId = itemId;

    /** @type {number} */
    this.elixirCost = elixirCost;

    /**
     * @param {Vector3} target
     * @param {Dimension} dimension
     * @returns {Entity[]}
     */
    this.invoke = invoke;
  }
}

/** @type {CraftRoyaleCard[]} */
const craftRoyaleCards = [
  new CraftRoyaleCard("craft_royale:zombies_card", 5, (target, dimension) => {
    const zombies = [];

    for (let i = 0; i < 5; i++) {
      const zombie = dimension.spawnEntity("minecraft:zombie", target);
      zombies.push(zombie);
    }

    return zombies;
  }),
  new CraftRoyaleCard("craft_royale:skeletons_card", 3, (target, dimension) => {
    const skeletons = [];

    for (let i = 0; i < 2; i++) {
      const skeleton = dimension.spawnEntity("minecraft:skeleton", target);
      skeletons.push(skeleton);
    }

    return skeletons;
  }),

  new CraftRoyaleCard("craft_royale:creepers_card", 2, (target, dimension) => {
    const creepers = [];

    for (let i = 0; i < 2; i++) {
      const creeper = dimension.spawnEntity("minecraft:creeper", target);
      creepers.push(creeper);
    }

    return creepers;
  }),

  new CraftRoyaleCard(
    "craft_royale:iron_golem_card",
    3,
    (target, dimension) => {
      return [dimension.spawnEntity("minecraft:iron_golem", target)];
    },
  ),
];

world.afterEvents.itemUse.subscribe((event) => {
  const player = event.source;
  const item = event.itemStack;

  if (item.typeId == "craft_royale:blue_crown") {
    const tags = player.getTags();
    for (const tag of tags) {
      player.removeTag(tag);
    }
    player.addTag("blue_team");
    player.triggerEvent("craft_royale:clear_team");
    player.triggerEvent("craft_royale:add_blue_team");
    player.sendMessage(`§9¡${player.name} se ha unido al Equipo Azul!`);
  }

  if (item.typeId == "craft_royale:red_crown") {
    const tags = player.getTags();
    for (const tag of tags) {
      player.removeTag(tag);
    }
    player.addTag("red_team");
    player.triggerEvent("craft_royale:clear_team");
    player.triggerEvent("craft_royale:add_red_team");
    player.sendMessage(`§c¡${player.name} se ha unido al Equipo Rojo!`);
  }

  if (player.hasTag("blue_team") || player.hasTag("red_team")) {
    for (const card of craftRoyaleCards) {
      if (item.typeId == card.itemId) {
        const raycastResult = player.getBlockFromViewDirection({
          maxDistance: 10,
        });

        if (!raycastResult) return;

        const targetBlock = raycastResult.block;

        if (player.level >= card.elixirCost) {
          const target = {
            x: targetBlock.x + 0.5,
            y: targetBlock.y + 1,
            z: targetBlock.z + 0.5,
          };

          const dimension = player.dimension;

          /**@type {Entity[]} */
          let entities = card.invoke(target, dimension);
          for (const entity of entities) {
            try {
              if (player.hasTag("blue_team")) {
                entity.nameTag = "§9Azul";
                entity.triggerEvent("craft_royale:add_blue_team");
              } else if (player.hasTag("red_team")) {
                entity.nameTag = "§cRojo";
                entity.triggerEvent("craft_royale:add_red_team");
              }
            } catch (error) {
              player.sendMessage(`Error al invocar carta: ${error}`);
            }
          }
        } else {
          player.sendMessage(
            `Necesitas ${card.elixirCost} niveles de experiencia`,
          );
        }
      }
    }
  }
});

system.runInterval(() => {
  const dimension = world.getDimension("overworld");
  const entities = dimension.getEntities({
    type: "craft_royale:princess_tower",
  });

  for (const entity of entities) {
    entity.clearVelocity();
  }
}, 1);
