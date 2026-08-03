import {
  Dimension,
  Entity,
  GameMode,
  ItemLockMode,
  ItemStack,
  MolangVariableMap,
  Player,
  system,
  world,
} from "@minecraft/server";
import { CraftRoyaleCard } from "../classes/craft_royale_card.js";
import { Team } from "../classes/team.js";
import { TowerManager } from "./tower_manager.js";
import { TeamManager } from "./team_manager.js";
import { SpawnManager } from "./particle_manager.js";
import { runIntervalFor } from "../utils/run_interval_for.js";
/**
 * @typedef {Object} CardInvokeContext
 * @property {Player} player
 * @property {Object} location
 * @property {number} location.x
 * @property {number} location.y
 * @property {number} location.z
 * @property {(identifier: string, location: {x: number, y: number, z: number} | undefined) => Entity} spawnEntity
 * @property {(options: ApplyEffectOptions) => void} applyEffect
 */

/**
 * @typedef {Object} ApplyEffectOptions
 * @property {{ x: number, y: number, z: number }} location
 * @property {{ x: number, y: number, z: number }} volume
 * @property {(entity: Entity) => void} effect
 * @property {() => void} onApply
 * @property {{ r: number, g: number, b:number }} color
 * @property {boolean} allies
 * @property {boolean} enemies
 * @property {boolean} includeTowers
 * @property {number} repetitions
 * @property {number} ticks
 */

export class CraftRoyaleCardManager {
  /**@type {Object<string, (ctx: CardInvokeContext) => void>} */
  static cardInvokes = {
    // Zombies
    zombie: (ctx) => {
      Array.from({ length: 4 }, () => {
        const e = ctx.spawnEntity("minecraft:zombie");
      });
    },

    // Skeletons
    skeleton: (ctx) => {
      Array.from({ length: 3 }, () => {
        const e = ctx.spawnEntity("minecraft:skeleton");
        e.addTag("anti_air");
      });
    },

    // Creeper
    creeper: (ctx) => {
      const e = ctx.spawnEntity("minecraft:creeper");
    },

    // Iron Golem
    iron_golem: (ctx) => {
      const e = ctx.spawnEntity("minecraft:iron_golem");
    },

    // Spiders
    spider: (ctx) => {
      Array.from({ length: 3 }, () => {
        const e = ctx.spawnEntity("minecraft:spider");
      });
      Array.from({ length: 3 }, () => {
        const e = ctx.spawnEntity("minecraft:cave_spider");
      });
    },

    // Enderman
    enderman: (ctx) => {
      const e = ctx.spawnEntity("minecraft:enderman");
    },

    // Silverfishes
    silverfish: (ctx) => {
      Array.from({ length: 30 }, () => {
        const e = ctx.spawnEntity("minecraft:silverfish");
      });
    },

    // Snow Golems
    snow_golem: (ctx) => {
      Array.from({ length: 4 }, () => {
        const e = ctx.spawnEntity("minecraft:snow_golem");
        e.addTag("anti_air");
      });
    },

    // Witch
    witch: (ctx) => {
      const e = ctx.spawnEntity("minecraft:witch");
    },

    // Zap / Lightning Bolt
    lightning_bolt: (ctx) => {
      const e = ctx.spawnEntity("minecraft:lightning_bolt", {
        x: ctx.location.x - 0.5,
        y: ctx.location.y,
        z: ctx.location.z - 0.5,
      });
      e.addTag("spell");

      ctx.applyEffect({
        location: {
          x: ctx.location.x - 1,
          y: ctx.location.y,
          z: ctx.location.z - 1,
        },
        volume: {
          x: 3,
          y: 0,
          z: 3,
        },
        effect: (entity) => {
          entity.applyDamage(10);
          entity.addEffect("slowness", 10, {
            amplifier: 255,
            showParticles: false,
          });
        },
        color: { r: 0, g: 0, b: 1 },
      });
    },

    // Arrows
    arrow: (ctx) => {
      const side = 8;
      const halfSide = Math.floor(side / 2);
      const height = 12;
      const repetitions = 3;
      const positions = [];

      for (let x = 0; x < side; x++) {
        for (let z = 0; z < side; z++) {
          positions.push({
            x: ctx.location.x - halfSide + x,
            y: ctx.location.y + height,
            z: ctx.location.z - halfSide + z,
          });
        }
      }

      ctx.applyEffect({
        location: {
          x: ctx.location.x - halfSide,
          y: ctx.location.y,
          z: ctx.location.z - halfSide,
        },
        volume: {
          x: side - 1,
          y: 0,
          z: side - 1,
        },
        effect: (e) => {
          e.applyDamage(10);
        },
        onApply: () => {
          for (const p of positions) {
            const spell = ctx.spawnEntity("minecraft:arrow", p);
            spell.addTag("spell");
            spell.addTag("in_match");
            system.runTimeout(() => {
              if (spell.isValid) {
                spell.remove();
              }
            }, 60);
          }
        },
        color: { r: 1, g: 1.5, b: 0 },
        repetitions: repetitions,
      });
    },

    // Vex
    vex: (ctx) => {
      const e = ctx.spawnEntity("minecraft:vex", {
        x: ctx.location.x,
        y: ctx.location.y + 4,
        z: ctx.location.z,
      });
      e.addTag("air");
      e.addTag("anti_air");
    },

    // Endermites
    endermite: (ctx) => {
      Array.from({ length: 4 }, () => {
        const e = ctx.spawnEntity("minecraft:endermite");
      });
    },

    // Ghast
    ghast: (ctx) => {
      Array.from({ length: 2 }, () => {
        const e = ctx.spawnEntity("minecraft:ghast", {
          x: ctx.location.x,
          y: ctx.location.y + 4,
          z: ctx.location.z,
        });
        e.addTag("air");
        e.addTag("anti_air");
      });
    },

    // Ravager
    ravager: (ctx) => {
      const e = ctx.spawnEntity("minecraft:ravager");
      const rider = ctx.spawnEntity("minecraft:pillager");

      e.addTag("win_condition");
      rider.addTag("anti_air");

      const rideable = e.getComponent("minecraft:rideable");
      if (rideable) {
        rideable.addRider(rider);
      }
    },

    // Pillagers
    pillager: (ctx) => {
      Array.from({ length: 5 }, (_, i) => {
        const e = ctx.spawnEntity("minecraft:pillager");
        if (i === 0) {
          try {
            e.triggerEvent("minecraft:spawn_as_illager_captain");
          } catch {
            e.triggerEvent("minecraft:promote_to_patrol_captain");
          }
        }
        e.addTag("anti_air");
      });
    },

    // Evoker
    evoker: (ctx) => {
      const e = ctx.spawnEntity("minecraft:evocation_illager");
    },

    // Vindicator
    vindicator: (ctx) => {
      const e = ctx.spawnEntity("minecraft:vindicator");
    },

    // Piglin Brute
    piglin_brute: (ctx) => {
      Array.from({ length: 2 }, () => {
        const e = ctx.spawnEntity("minecraft:piglin_brute");
        e.runCommand(
          "replaceitem entity @s slot.weapon.mainhand 0 netherite_axe",
        );
      });
    },

    // Piglin
    piglin: (ctx) => {
      Array.from({ length: 5 }, (_, i) => {
        const e = ctx.spawnEntity("minecraft:piglin");
        if (i < 3) {
          e.runCommand("replaceitem entity @s slot.weapon.mainhand 0 crossbow");
          e.addTag("anti_air");
        } else {
          e.runCommand(
            "replaceitem entity @s slot.weapon.mainhand 0 golden_sword",
          );
        }
      });
    },

    // Wither Skeleton
    wither_skeleton: (ctx) => {
      const e = ctx.spawnEntity("minecraft:wither_skeleton");
    },

    // Blaze
    blaze: (ctx) => {
      Array.from({ length: 2 }, () => {
        const e = ctx.spawnEntity("minecraft:blaze");
        e.addTag("anti_air");
      });
    },

    // Zombified Piglin
    zombified_piglin: (ctx) => {
      Array.from({ length: 4 }, () => {
        const e = ctx.spawnEntity("minecraft:zombie_pigman");
        e.addTag("win_condition");
      });
    },

    // Hoglin
    hoglin: (ctx) => {
      const e = ctx.spawnEntity("minecraft:hoglin");
      const rider = ctx.spawnEntity("minecraft:piglin");

      e.addTag("win_condition");
      rider.addTag("win_condition");

      rider.runCommand("replaceitem entity @s slot.armor.head 0 golden_helmet");
      rider.runCommand(
        "replaceitem entity @s slot.armor.chest 0 golden_chestplate",
      );
      rider.runCommand(
        "replaceitem entity @s slot.armor.legs 0 golden_leggings",
      );
      rider.runCommand("replaceitem entity @s slot.armor.feet 0 golden_boots");
      rider.runCommand(
        "replaceitem entity @s slot.weapon.mainhand 0 golden_sword",
      );

      const rideable = e.getComponent("minecraft:rideable");
      if (rideable) {
        rideable.addRider(rider);
      }
    },

    // Zoglin
    zoglin: (ctx) => {
      const e = ctx.spawnEntity("minecraft:zoglin");
    },

    // Shulker
    shulker: (ctx) => {
      const e = ctx.spawnEntity("minecraft:shulker");
      e.addTag("buildings");
      e.addTag("anti_air");
    },

    // Drowned
    drowned: (ctx) => {
      const e = ctx.spawnEntity("minecraft:drowned");
      e.triggerEvent("minecraft:switch_to_ranged");
      e.runCommand("replaceitem entity @s slot.weapon.mainhand 0 trident");
      e.addTag("anti_air");
    },

    // Wolf
    wolf: (ctx) => {
      Array.from({ length: 6 }, () => {
        const e = ctx.spawnEntity("minecraft:wolf");
        e.runCommand("replaceitem entity @s slot.armor.body 0 wolf_armor");
      });
    },

    // Breeze
    breeze: (ctx) => {
      Array.from({ length: 2 }, () => {
        const e = ctx.spawnEntity("minecraft:breeze");
        e.addTag("anti_air");
      });
    },

    // Phantom
    phantom: (ctx) => {
      Array.from({ length: 3 }, () => {
        const e = ctx.spawnEntity("minecraft:phantom", {
          x: ctx.location.x,
          y: ctx.location.y + 4,
          z: ctx.location.z,
        });
        e.addTag("win_condition");
        e.addTag("air");
        e.addTag("anti_air");
      });
    },

    // Bee
    bee: (ctx) => {
      Array.from({ length: 6 }, () => {
        const e = ctx.spawnEntity("minecraft:bee", {
          x: ctx.location.x,
          y: ctx.location.y + 4,
          z: ctx.location.z,
        });
        e.addTag("air");
        e.addTag("anti_air");
      });
    },
  };

  static deckSize = 8;
  static handSize = 4;

  /** @type {Map<string, string[]>} */
  static decks = new Map();

  /**
   *
   * @param {string} itemId
   * @param {Player} player
   * @param {Team | undefined} team
   */
  static invoke(itemId, player, team = undefined) {
    const card = CraftRoyaleCard.getFromItemId(itemId);
    if (!card) return;

    const cardInvoke = this.cardInvokes[card.key];
    if (!cardInvoke) return;

    if (player.getGameMode() != GameMode.Creative && player.level < card.cost) {
      player.sendMessage("§cInsufficient elixir");
      return;
    }

    const summoningLocation = this.getSummoningLocation(player);

    if (
      !card.enemySide &&
      team &&
      TowerManager.isInTowerArea(
        summoningLocation,
        player.dimension,
        team.rivals,
      )
    ) {
      player.sendMessage("§cRestricted area");
      return;
    }

    if (player.getGameMode() != GameMode.Creative) {
      player.addLevels(-card.cost);
    }

    cardInvoke({
      player: player,
      location: summoningLocation,
      spawnEntity: (identifier, location) => {
        const e = player.dimension.spawnEntity(
          identifier,
          location ?? summoningLocation,
        );
        TeamManager.addEntityToTeam(e, team);
        e.addTag("in_match");
        return e;
      },
      applyEffect: (options = {}) => {
        const {
          location = summoningLocation,
          volume = { x: 1, y: 1, z: 1 },
          effect = () => {},
          onApply = () => {},
          color = { r: 1, g: 1, b: 1 },
          allies = false,
          enemies = true,
          includeTowers = false,
          repetitions = 1,
          ticks = 20,
        } = options;

        function handler() {
          player.dimension
            .getEntities({
              location: location,
              volume: volume,
            })
            .filter((entity) => {
              const isAlly = entity.hasTag(team.key);
              if (!includeTowers && entity.hasTag("tower")) return false;
              return (
                entity.hasTag("in_match") &&
                ((allies && isAlly) || (enemies && !isAlly))
              );
            })
            .forEach((e) => {
              effect(e);
            });
          SpawnManager.spawnArea(
            player.dimension,
            location,
            {
              x: location.x + volume.x,
              y: location.y + volume.y,
              z: location.z + volume.z,
            },
            1,
            "minecraft:mobspell_emitter",
            color,
          );
          onApply();
        }

        handler();

        runIntervalFor(
          (i) => {
            handler();
          },
          ticks,
          repetitions - 1,
        );
      },
    });

    this.rotateDeck(player, itemId);
  }

  /**
   *
   * @param {Player} player
   * @returns {{ x: number, y: number, z: number }}
   */
  static getSummoningLocation(player) {
    const dimension = player.dimension;

    /**@type {{ x: number, y: number, z: number } | undefined} */
    let targetBlock;
    /**@type {{ x: number, y: number, z: number } | undefined} */
    let targetEntity;

    const blockHit = player.getBlockFromViewDirection();

    if (blockHit) {
      const block = blockHit.block;
      const face = blockHit.face;

      const offsets = {
        Up: { x: 0, y: 1, z: 0 },
        Down: { x: 0, y: -1, z: 0 },
        North: { x: 0, y: 0, z: -1 },
        South: { x: 0, y: 0, z: 1 },
        East: { x: 1, y: 0, z: 0 },
        West: { x: -1, y: 0, z: 0 },
      };

      const offset = offsets[face] || { x: 0, y: 1, z: 0 };

      targetBlock = {
        x: block.location.x + offset.x + 0.5,
        y: block.location.y + offset.y,
        z: block.location.z + offset.z + 0.5,
      };
    }

    const entityHit = player.getEntitiesFromViewDirection()[0];
    if (entityHit) {
      const entity = entityHit.entity;
      targetEntity = entity.location;
    }

    if (blockHit && !entityHit) {
      return targetBlock;
    } else if (!blockHit && entityHit) {
      return targetEntity;
    } else if (blockHit && entityHit) {
      const blockDelta = this.getDistance(player.location, targetBlock);
      const entityDelta = this.getDistance(player.location, targetEntity);
      return blockDelta <= entityDelta ? targetBlock : targetEntity;
    } else {
      return player.location;
    }
  }

  /**
   * @param {{x: number, y: number, z: number}} p1
   * @param {{x: number, y: number, z: number}} p2
   * @returns {number}
   */
  static getDistance(p1, p2) {
    const dx = Math.abs(p2.x - p1.x);
    const dy = Math.abs(p2.x - p1.x);
    const dz = Math.abs(p2.x - p1.x);
    return Math.hypot(dx, dy, dz);
  }

  /**
   *
   * @param {Player} player
   */
  static addDeck(player) {
    if (this.decks.has(player.id)) return;

    const inventory = player.getComponent("minecraft:inventory")?.container;
    if (!inventory) return;

    const cards = new Set();

    for (let i = 0; i < inventory.size; i++) {
      const item = inventory.getItem(i);
      if (item && item.typeId.startsWith(CraftRoyaleCard.prefix)) {
        if (cards.size >= this.deckSize) break;
        cards.add(item.typeId);
      }
    }

    if (cards.size < this.deckSize) {
      const cardsAvailable = CraftRoyaleCard.values.filter(
        (c) => !cards.has(c.itemId),
      );
      while (cards.size < this.deckSize && cardsAvailable.length > 0) {
        const randomIndex = Math.floor(Math.random() * cardsAvailable.length);
        const [selectedCard] = cardsAvailable.splice(randomIndex, 1);
        cards.add(selectedCard.itemId);
      }
    }

    const deck = Array.from(cards).sort(() => Math.random() - 0.5);

    this.decks.set(player.id, []);
    inventory.clearAll();

    for (let i = 0; i < deck.length; i++) {
      if (i < this.handSize) {
        const item = new ItemStack(deck[i], 1);
        item.keepOnDeath = true;
        item.lockMode = ItemLockMode.slot;
        inventory.addItem(item);
      } else {
        this.decks.get(player.id).push(deck[i]);
      }
    }
  }

  static clearDecks() {
    const keys = Array.from(this.decks.keys());
    for (const k of keys) {
      const player = world.getEntity(k);
      if (player && player instanceof Player) {
        const inventory = player.getComponent("minecraft:inventory")?.container;
        for (let i = 0; i < inventory.size; i++) {
          const item = inventory.getItem(i);
          if (item && item.typeId.startsWith("craft_royale_card:")) {
            this.decks.get(k).push(item.typeId);
          }
        }
        inventory.clearAll();
        for (const card of this.decks.get(k)) {
          const item = new ItemStack(card, 1);
          inventory.addItem(item);
        }
      }
      this.decks.delete(k);
    }
  }

  /**
   *
   * @param {Player} player
   */
  static rotateDeck(player, itemId) {
    if (this.decks.has(player.id)) {
      const inventory = player.getComponent("minecraft:inventory")?.container;
      if (inventory) {
        const newCardTypeId = this.decks.get(player.id).shift();
        const newCard = new ItemStack(newCardTypeId, 1);
        newCard.keepOnDeath = true;
        newCard.lockMode = ItemLockMode.slot;
        this.decks.get(player.id).push(itemId);
        inventory.setItem(player.selectedSlotIndex, newCard);
      }
    }
  }
}
