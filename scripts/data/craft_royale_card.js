/**
 * @typedef {Object} CraftRoyaleCardOptions
 * @property {string} itemId
 * @property {string} name
 * @property {string} icon
 * @property {number} elixirCost
 * @property {(target: Vector3, dimension: Dimension) => Entity[]} invoke
 */

import { system } from "@minecraft/server";

export class CraftRoyaleCard {
  /**
   * @param {CraftRoyaleCardOptions} options
   */
  constructor({ itemId, name, icon, elixirCost, invoke }) {
    /** @type {string} */
    this.itemId = itemId;

    /** @type {string} */
    this.name = name;

    /** @type {string} */
    this.icon = icon;

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
  //Zombies
  new CraftRoyaleCard({
    itemId: "craft_royale_card:zombie_card",
    name: "Zombies",
    icon: "zombie_card",
    elixirCost: 2,
    invoke: (target, dimension) => {
      const zombies = [];

      for (let i = 0; i < 4; i++) {
        const zombie = dimension.spawnEntity("minecraft:zombie", target);
        zombies.push(zombie);
      }

      return zombies;
    },
  }),

  //SkeletonsCard
  new CraftRoyaleCard({
    itemId: "craft_royale_card:skeleton_card",
    name: "Skeletons",
    icon: "skeleton_card",
    elixirCost: 2,
    invoke: (target, dimension) => {
      const skeletons = [];

      for (let i = 0; i < 3; i++) {
        const skeleton = dimension.spawnEntity("minecraft:skeleton", target);
        skeleton.addTag("anti_air");
        skeletons.push(skeleton);
      }

      return skeletons;
    },
  }),

  //CreepersCard
  new CraftRoyaleCard({
    itemId: "craft_royale_card:creeper_card",
    name: "Creeper",
    icon: "creeper_card",
    elixirCost: 1,
    invoke: (target, dimension) => {
      const creepers = [];

      for (let i = 0; i < 1; i++) {
        const creeper = dimension.spawnEntity("minecraft:creeper", target);
        creepers.push(creeper);
      }

      return creepers;
    },
  }),

  //IronGolemCard
  new CraftRoyaleCard({
    itemId: "craft_royale_card:iron_golem_card",
    name: "Iron Golem",
    icon: "iron_golem_card",
    elixirCost: 7,
    invoke: (target, dimension) => {
      return [dimension.spawnEntity("minecraft:iron_golem", target)];
    },
  }),

  //Spiders
  new CraftRoyaleCard({
    itemId: "craft_royale_card:spider_card",
    name: "Spiders",
    icon: "spider_card",
    elixirCost: 3,
    invoke: (target, dimension) => {
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
  }),

  //Enderman
  new CraftRoyaleCard({
    itemId: "craft_royale_card:enderman_card",
    name: "Enderman",
    icon: "enderman_card",
    elixirCost: 4,
    invoke: (target, dimension) => {
      return [dimension.spawnEntity("minecraft:enderman", target)];
    },
  }),

  //Silverfishes
  new CraftRoyaleCard({
    itemId: "craft_royale_card:silverfish_card",
    name: "Silverfishes",
    icon: "silverfish_card",
    elixirCost: 3,
    invoke: (target, dimension) => {
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
  }),

  //Snow Golems
  new CraftRoyaleCard({
    itemId: "craft_royale_card:snow_golem_card",
    name: "Snow Golems",
    icon: "snow_golem_card",
    elixirCost: 1,
    invoke: (target, dimension) => {
      const snowGolems = [];

      for (let i = 0; i < 4; i++) {
        const snowGolem = dimension.spawnEntity("minecraft:snow_golem", target);
        snowGolem.addTag("anti_air");
        snowGolems.push(snowGolem);
      }

      return snowGolems;
    },
  }),

  //Witch
  new CraftRoyaleCard({
    itemId: "craft_royale_card:witch_card",
    name: "Witch",
    icon: "witch_card",
    elixirCost: 4,
    invoke: (target, dimension) => {
      const e = dimension.spawnEntity("minecraft:witch", target);
      return [e];
    },
  }),

  //Zap
  new CraftRoyaleCard({
    itemId: "craft_royale_card:lightning_bolt_card",
    name: "Zap",
    icon: "lightning_bolt_card",
    elixirCost: 2,
    invoke: (target, dimension) => {
      const side = 3;
      const halfSide = Math.floor(side / 2); // Para centrar el patrón en la posición del target
      const positions = [];

      for (let x = 0; x < side; x++) {
        for (let z = 0; z < side; z++) {
          positions.push({
            x: target.x - halfSide + x,
            y: target.y,
            z: target.z - halfSide + z,
          });
        }
      }

      return positions.map((p) => {
        const e = dimension.spawnEntity("minecraft:lightning_bolt", p);
        e.addTag("spell");
        return e;
      });
    },
  }),

  //Arrows
  new CraftRoyaleCard({
    itemId: "craft_royale_card:arrow_card",
    name: "Arrows",
    icon: "arrow_card",
    elixirCost: 3,
    invoke: (target, dimension) => {
      const side = 6;
      const halfSide = Math.floor(side / 2);
      const height = 12;
      const heightDelta = 4;
      const positions = [];

      for (let x = 0; x < side; x++) {
        for (let z = 0; z < side; z++) {
          positions.push({
            x: target.x - halfSide + x,
            y: target.y + height,
            z: target.z - halfSide + z,
          });
        }
      }

      const repetitions = 1;
      let finalPositions = [];
      for (let i = 0; i < repetitions; i++) {
        finalPositions = finalPositions.concat(
          Array.from(positions, (p, _) => {
            return { x: p.x, y: p.y + i * heightDelta, z: p.z };
          }),
        );
      }

      return finalPositions.map((p) => {
        const e = dimension.spawnEntity("minecraft:arrow", p);
        e.addTag("spell");

        const projectile = e.getComponent("minecraft:projectile");
        projectile.shoot({ x: 0, y: -4, z: 0 }, { power: 20 });
        return e;
      });
    },
  }),

  //vex
  new CraftRoyaleCard({
    itemId: "craft_royale_card:vex_card",
    name: "Vex",
    icon: "vex_card",
    elixirCost: 3,
    invoke: (target, dimension) => {
      const e = dimension.spawnEntity("minecraft:vex", {
        x: target.x,
        y: target.y + 4,
        z: target.z,
      });
      e.addTag("air");
      e.addTag("anti_air");
      return [e];
    },
  }),

  //Endermites
  new CraftRoyaleCard({
    itemId: "craft_royale_card:endermite_card",
    name: "Endermites",
    icon: "endermite_card",
    elixirCost: 1,
    invoke: (target, dimension) => {
      return Array.from({ length: 4 }, (_, i) =>
        dimension.spawnEntity("minecraft:endermite", target),
      );
    },
  }),

  //Slimes
  /*new CraftRoyaleCard({
    itemId: "craft_royale_card:slime_card",
    name: "Slimes",
    icon: "slime_card",
    elixirCost: 1,
    invoke: (target, dimension) => {
      return Array.from({ length: 2 }, (_, i) => {
        const slime = dimension.spawnEntity("minecraft:slime", target);
        const sizeComponent = slime.getComponent("minecraft:slime_size");
        if (sizeComponent) {
          sizeComponent.value = 2;
        }
        return slime;
      });
    },
  }),

  //Magma Cube
  new CraftRoyaleCard({
    itemId: "craft_royale_card:magma_cube_card",
    name: "Magma Cube",
    icon: "magma_cube_card",
    elixirCost: 1,
    invoke: (target, dimension) => {
      return Array.from({ length: 1 }, (_, i) => {
        const magma = dimension.spawnEntity("minecraft:magma_cube", target);
        const sizeComponent = magma.getComponent("minecraft:slime_size");
        if (sizeComponent) {
          sizeComponent.value = 2;
        }
        return magma;
      });
    },
  }),*/

  //Ghast
  new CraftRoyaleCard({
    itemId: "craft_royale_card:ghast_card",
    name: "Ghasts",
    icon: "ghast_card",
    elixirCost: 4,
    invoke: (target, dimension) => {
      return Array.from({ length: 2 }, (_, i) => {
        const e = dimension.spawnEntity("minecraft:ghast", {
          x: target.x,
          y: target.y + 4,
          z: target.z,
        });
        e.addTag("air");
        e.addTag("anti_air");
        return e;
      });
    },
  }),

  //Ravager
  new CraftRoyaleCard({
    itemId: "craft_royale_card:ravager_card",
    name: "Ravager",
    icon: "ravager_card",
    elixirCost: 7,
    invoke: (target, dimension) => {
      const ravager = dimension.spawnEntity("minecraft:ravager", target);
      const pillager = dimension.spawnEntity("minecraft:pillager", target);
      ravager.addTag("win_condition");
      pillager.addTag("anti_air");
      const rideable = ravager.getComponent("minecraft:rideable");
      if (rideable) {
        rideable.addRider(pillager);
      }
      return [ravager, pillager];
    },
  }),

  //Pillager
  new CraftRoyaleCard({
    itemId: "craft_royale_card:pillager_card",
    name: "Pillagers",
    icon: "pillager_card",
    elixirCost: 5,
    invoke: (target, dimension) => {
      return Array.from({ length: 5 }, (_, i) => {
        const pillager = dimension.spawnEntity("minecraft:pillager", target);
        if (i == 0) {
          try {
            pillager.triggerEvent("minecraft:spawn_as_illager_captain");
          } catch (e) {
            pillager.triggerEvent("minecraft:promote_to_patrol_captain");
          }
        }
        pillager.addTag("anti_air");
        return pillager;
      });
    },
  }),

  //Evoker
  new CraftRoyaleCard({
    itemId: "craft_royale_card:evoker_card",
    name: "Evoker",
    icon: "evoker_card",
    elixirCost: 4,
    invoke: (target, dimension) => {
      const e = dimension.spawnEntity("minecraft:evocation_illager", target);
      return [e];
    },
  }),

  //Vindicator
  new CraftRoyaleCard({
    itemId: "craft_royale_card:vindicator_card",
    name: "Vindicator",
    icon: "vindicator_card",
    elixirCost: 4,
    invoke: (target, dimension) => {
      return [dimension.spawnEntity("minecraft:vindicator", target)];
    },
  }),

  //Piglin Brutes
  new CraftRoyaleCard({
    itemId: "craft_royale_card:piglin_brute_card",
    name: "Piglin Brutes",
    icon: "piglin_brute_card",
    elixirCost: 6,
    invoke: (target, dimension) =>
      Array.from({ length: 2 }, (_, i) => {
        const e = dimension.spawnEntity("minecraft:piglin_brute", target);
        e.runCommand(
          "replaceitem entity @s slot.weapon.mainhand 0 netherite_axe",
        );
        return e;
      }),
  }),

  //Piglin Gang
  new CraftRoyaleCard({
    itemId: "craft_royale_card:piglin_card",
    name: "Piglins",
    icon: "piglin_card",
    elixirCost: 3,
    invoke: (target, dimension) =>
      Array.from({ length: 5 }, (_, i) => {
        const e = dimension.spawnEntity("minecraft:piglin", target);
        if (i < 3) {
          e.runCommand("replaceitem entity @s slot.weapon.mainhand 0 crossbow");
          e.addTag("anti_air");
        } else {
          e.runCommand(
            "replaceitem entity @s slot.weapon.mainhand 0 golden_sword",
          );
        }
        return e;
      }),
  }),

  //Wither Skeleton
  new CraftRoyaleCard({
    itemId: "craft_royale_card:wither_skeleton_card",
    name: "Whiter Skeleton",
    icon: "wither_skeleton_card",
    elixirCost: 2,
    invoke: (target, dimension) => {
      return [dimension.spawnEntity("minecraft:wither_skeleton", target)];
    },
  }),

  //Blaze
  new CraftRoyaleCard({
    itemId: "craft_royale_card:blaze_card",
    name: "Blazes",
    icon: "blaze_card",
    elixirCost: 4,
    invoke: (target, dimension) =>
      Array.from({ length: 2 }, (_, i) => {
        const e = dimension.spawnEntity("minecraft:blaze", target);
        e.addTag("anti_air");
        return e;
      }),
  }),

  //Zombified Piglins
  new CraftRoyaleCard({
    itemId: "craft_royale_card:zombified_piglin_card",
    name: "Zombified Piglins",
    icon: "zombified_piglin_card",
    elixirCost: 5,
    invoke: (target, dimension) => {
      return Array.from({ length: 4 }, (_, i) => {
        const e = dimension.spawnEntity("minecraft:zombie_pigman", target);
        e.addTag("win_condition");
        return e;
      });
    },
  }),

  //Hoglin
  new CraftRoyaleCard({
    itemId: "craft_royale_card:hoglin_card",
    name: "Hoglin",
    icon: "hoglin_card",
    elixirCost: 4,
    invoke: (target, dimension) => {
      const e = dimension.spawnEntity("minecraft:hoglin", target);
      const r = dimension.spawnEntity("minecraft:piglin", target);
      e.addTag("win_condition");
      r.addTag("win_condition");
      r.runCommand("replaceitem entity @s slot.armor.head 0 golden_helmet");
      r.runCommand(
        "replaceitem entity @s slot.armor.chest 0 golden_chestplate",
      );
      r.runCommand("replaceitem entity @s slot.armor.legs 0 golden_leggings");
      r.runCommand("replaceitem entity @s slot.armor.feet 0 golden_boots");
      r.runCommand("replaceitem entity @s slot.weapon.mainhand 0 golden_sword");
      const rideable = e.getComponent("minecraft:rideable");
      if (rideable) {
        rideable.addRider(r);
      }
      return [e, r];
    },
  }),

  //Zoglin
  new CraftRoyaleCard({
    itemId: "craft_royale_card:zoglin_card",
    name: "Zoglin",
    icon: "zoglin_card",
    elixirCost: 3,
    invoke: (target, dimension) => {
      return [dimension.spawnEntity("minecraft:zoglin", target)];
    },
  }),

  //Shulker
  new CraftRoyaleCard({
    itemId: "craft_royale_card:shulker",
    name: "Shulker",
    icon: "shulker_card",
    elixirCost: 5,
    invoke: (target, dimension) => {
      const e = dimension.spawnEntity("minecraft:shulker", target);
      e.addTag("buildings");
      e.addTag("anti_air");
      return [e];
    },
  }),

  //Guardians
  /*new CraftRoyaleCard({
    itemId: "craft_royale_card:guardian_card",
    name: "Guardians",
    icon: "guardian_card",
    elixirCost: 4,
    invoke: (target, dimension) => {
      return [
        dimension.spawnEntity("minecraft:elder_guardian", target),
        dimension.spawnEntity("minecraft:guardian", target),
        dimension.spawnEntity("minecraft:guardian", target),
      ];
    },
  }),*/

  //Drowned
  new CraftRoyaleCard({
    itemId: "craft_royale_card:drowned_card",
    name: "Drowned",
    icon: "drowned_card",
    elixirCost: 4,
    invoke: (target, dimension) => {
      const e = dimension.spawnEntity("minecraft:drowned", target);
      e.triggerEvent("minecraft:switch_to_ranged");
      e.runCommand("replaceitem entity @s slot.weapon.mainhand 0 trident");
      e.addTag("anti_air");
      return [e];
    },
  }),

  //Wolfs
  new CraftRoyaleCard({
    itemId: "craft_royale_card:wolf_card",
    name: "Wolfs",
    icon: "wolf_card",
    elixirCost: 7,
    invoke: (target, dimension) =>
      Array.from({ length: 6 }, (_, i) => {
        const wolf = dimension.spawnEntity("minecraft:wolf", target);
        wolf.runCommand("replaceitem entity @s slot.armor.body 0 wolf_armor");
        return wolf;
      }),
  }),

  //Breeze
  new CraftRoyaleCard({
    itemId: "craft_royale_card:breeze_card",
    name: "Breeze",
    icon: "breeze_card",
    elixirCost: 4,
    invoke: (target, dimension) => {
      const e = dimension.spawnEntity("minecraft:breeze", target);
      e.addTag("anti_air");
      return [e];
    },
  }),

  //Phantoms
  new CraftRoyaleCard({
    itemId: "craft_royale_card:phantom_card",
    name: "Phantoms",
    icon: "phantom_card",
    elixirCost: 2,
    invoke: (target, dimension) =>
      Array.from({ length: 3 }, (_, i) => {
        const e = dimension.spawnEntity("minecraft:phantom", {
          x: target.x,
          y: target.y + 4,
          z: target.z,
        });
        e.addTag("win_condition");
        e.addTag("air");
        e.addTag("anti_air");
        return e;
      }),
  }),

  //Bees
  new CraftRoyaleCard({
    itemId: "craft_royale_card:bee_card",
    name: "Bees",
    icon: "bee_card",
    elixirCost: 2,
    invoke: (target, dimension) =>
      Array.from({ length: 6 }, (_, i) => {
        const e = dimension.spawnEntity("minecraft:bee", {
          x: target.x,
          y: target.y + 4,
          z: target.z,
        });
        e.addTag("air");
        e.addTag("anti_air");
        return e;
      }),
  }),

  //Goats
  /*new CraftRoyaleCard({
    itemId: "craft_royale_card:goat_card",
    name: "Goats",
    icon: "goat_card",
    elixirCost: 1,
    invoke: (target, dimension) =>
      Array.from({ length: 4 }, (_, i) => {
        const e = dimension.spawnEntity("minecraft:goat", {
          x: target.x,
          y: target.y,
          z: target.z,
        });
        return e;
      }),
  }),*/
];
