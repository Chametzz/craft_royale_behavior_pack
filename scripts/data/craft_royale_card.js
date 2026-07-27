import { world } from "@minecraft/server";

export class CraftRoyaleCard {
  /**
   * @param {string} itemId
   * @param {number} elixirCost
   * @param {(target: Vector3, dimension: Dimension) => Entity[]} invoke
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
export const craftRoyaleCards = [
  //ZombiesCard
  new CraftRoyaleCard(
    "craft_royale_card:zombie_card",
    5,
    (target, dimension) => {
      const zombies = [];

      for (let i = 0; i < 5; i++) {
        const zombie = dimension.spawnEntity("minecraft:zombie", target);
        zombies.push(zombie);
      }

      return zombies;
    },
  ),

  //SkeletonsCard
  new CraftRoyaleCard(
    "craft_royale_card:skeleton_card",
    3,
    (target, dimension) => {
      const skeletons = [];

      for (let i = 0; i < 2; i++) {
        const skeleton = dimension.spawnEntity("minecraft:skeleton", target);
        skeletons.push(skeleton);
      }

      return skeletons;
    },
  ),

  //CreepersCard
  new CraftRoyaleCard(
    "craft_royale_card:creeper_card",
    1,
    (target, dimension) => {
      const creepers = [];

      for (let i = 0; i < 1; i++) {
        const creeper = dimension.spawnEntity("minecraft:creeper", target);
        creepers.push(creeper);
      }

      return creepers;
    },
  ),

  //IronGolemCard
  new CraftRoyaleCard(
    "craft_royale_card:iron_golem_card",
    7,
    (target, dimension) => {
      return [dimension.spawnEntity("minecraft:iron_golem", target)];
    },
  ),

  //Spiders
  new CraftRoyaleCard(
    "craft_royale_card:spider_card",
    3,
    (target, dimension) => {
      const spiders = [];

      for (let i = 0; i < 3; i++) {
        const spider = dimension.spawnEntity("minecraft:spider", target);
        spiders.push(spider);
      }

      for (let i = 0; i < 3; i++) {
        const spider = dimension.spawnEntity("minecraft:cave_spider", target);
        spiders.push(spider);
      }

      return spiders;
    },
  ),

  //Enderman
  new CraftRoyaleCard(
    "craft_royale_card:enderman_card",
    4,
    (target, dimension) => {
      return [dimension.spawnEntity("minecraft:enderman", target)];
    },
  ),

  //Silverfishes
  new CraftRoyaleCard(
    "craft_royale_card:silverfish_card",
    3,
    (target, dimension) => {
      const silverfishes = [];

      for (let i = 0; i < 30; i++) {
        const silverfish = dimension.spawnEntity(
          "minecraft:silverfish",
          target,
        );
        silverfishes.push(silverfish);
      }

      return silverfishes;
    },
  ),

  //Snow Golems
  new CraftRoyaleCard(
    "craft_royale_card:snow_golem_card",
    1,
    (target, dimension) => {
      const snowGolems = [];

      for (let i = 0; i < 3; i++) {
        const snowGolem = dimension.spawnEntity("minecraft:snow_golem", target);
        snowGolems.push(snowGolem);
      }

      return snowGolems;
    },
  ),

  //Witch
  new CraftRoyaleCard(
    "craft_royale_card:witch_card",
    2,
    (target, dimension) => {
      return [dimension.spawnEntity("minecraft:witch", target)];
    },
  ),

  //Zap
  new CraftRoyaleCard(
    "craft_royale_card:lightning_bolt_card",
    2,
    (target, dimension) => {
      return [
        dimension.spawnEntity("minecraft:lightning_bolt", target),
        dimension.spawnEntity("minecraft:lightning_bolt", target),
      ];
    },
  ),

  //Arrows
  new CraftRoyaleCard(
    "craft_royale_card:arrow_card",
    3,
    (target, dimension) => {
      const arrows = [];
      const heightOffset = 8;

      for (let dx = -4; dx <= 4; dx++) {
        for (let dz = -4; dz <= 4; dz++) {
          if ((dx + dz) % 2 === 0) {
            const spawnPos = {
              x: target.x + dx,
              y: target.y + heightOffset,
              z: target.z + dz,
            };

            const arrow = dimension.spawnEntity("minecraft:arrow", spawnPos);

            arrow.applyImpulse({ x: 0, y: -1.2, z: 0 });
            arrows.push(arrow);
          }
        }
      }

      return arrows;
    },
  ),

  //vex
  new CraftRoyaleCard("craft_royale_card:vex_card", 3, (target, dimension) => {
    return [
      dimension.spawnEntity("minecraft:vex", {
        x: target.x,
        y: target.y + 4,
        z: target.z,
      }),
    ];
  }),

  //Endermites
  new CraftRoyaleCard(
    "craft_royale_card:endermite_card",
    1,
    (target, dimension) => {
      return Array.from({ length: 4 }, (_, i) =>
        dimension.spawnEntity("minecraft:endermite", target),
      );
    },
  ),

  //Slimes
  new CraftRoyaleCard(
    "craft_royale_card:slime_card",
    4,
    (target, dimension) => {
      return Array.from({ length: 2 }, (_, i) => {
        const slime = dimension.spawnEntity("minecraft:slime", target);
        const sizeComponent = slime.getComponent("minecraft:slime_size");
        if (sizeComponent) {
          sizeComponent.value = 2;
        }
        return slime;
      });
    },
  ),

  //Magma Cube
  new CraftRoyaleCard(
    "craft_royale_card:magma_cube_card",
    4,
    (target, dimension) => {
      return Array.from({ length: 1 }, (_, i) => {
        const magma = dimension.spawnEntity("minecraft:magma_cube", target);
        const sizeComponent = magma.getComponent("minecraft:slime_size");
        if (sizeComponent) {
          sizeComponent.value = 2;
        }
        return magma;
      });
    },
  ),

  //Ghasts
  new CraftRoyaleCard(
    "craft_royale_card:ghast_card",
    4,
    (target, dimension) => {
      return Array.from({ length: 2 }, (_, i) =>
        dimension.spawnEntity("minecraft:ghast", {
          x: target.x,
          y: target.y + 4,
          z: target.z,
        }),
      );
    },
  ),

  //Ravager
  new CraftRoyaleCard(
    "craft_royale_card:ravager_card",
    4,
    (target, dimension) => {
      const ravager = dimension.spawnEntity("minecraft:ravager", target);
      const pillager = dimension.spawnEntity("minecraft:pillager", target);
      const rideable = ravager.getComponent("minecraft:rideable");
      if (rideable) {
        rideable.addRider(pillager);
      }
      return [ravager, pillager];
    },
  ),
];
