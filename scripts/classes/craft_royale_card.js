export class CraftRoyaleCard {
  static prefix = "craft_royale_card:";
  static suffix = "_card";

  static zombie = new CraftRoyaleCard({
    key: "zombie",
    cost: 2,
    name: "Zombies",
  });
  static skeleton = new CraftRoyaleCard({
    key: "skeleton",
    cost: 3,
    name: "Skeletons",
  });
  static creeper = new CraftRoyaleCard({
    key: "creeper",
    cost: 1,
    name: "Creeper",
  });
  static ironGolem = new CraftRoyaleCard({
    key: "iron_golem",
    cost: 7,
    name: "Iron Golem",
  });
  static spider = new CraftRoyaleCard({
    key: "spider",
    cost: 3,
    name: "Spiders",
  });
  static enderman = new CraftRoyaleCard({
    key: "enderman",
    cost: 4,
    name: "Enderman",
  });
  static silverfish = new CraftRoyaleCard({
    key: "silverfish",
    cost: 3,
    name: "Silverfishes",
  });
  static snowGolem = new CraftRoyaleCard({
    key: "snow_golem",
    cost: 1,
    name: "Snow Golems",
  });
  static witch = new CraftRoyaleCard({
    key: "witch",
    cost: 3,
    name: "Witch",
  });
  static lightningBolt = new CraftRoyaleCard({
    key: "lightning_bolt",
    cost: 2,
    name: "Lightning Bolt",
    enemySide: true,
  });
  static arrow = new CraftRoyaleCard({
    key: "arrow",
    cost: 3,
    name: "Arrows",
    enemySide: true,
  });
  static arrow = new CraftRoyaleCard({
    key: "arrow",
    cost: 3,
    name: "Arrows",
    enemySide: true,
  });
  static vex = new CraftRoyaleCard({
    key: "vex",
    cost: 2,
    name: "Vex",
  });
  static endermite = new CraftRoyaleCard({
    key: "endermite",
    cost: 1,
    name: "Endermites",
  });
  static endermite = new CraftRoyaleCard({
    key: "endermite",
    cost: 1,
    name: "Endermites",
  });
  static ghast = new CraftRoyaleCard({
    key: "ghast",
    cost: 3,
    name: "Ghast",
  });
  static ravager = new CraftRoyaleCard({
    key: "ravager",
    cost: 7,
    name: "Ravager",
  });
  static pillager = new CraftRoyaleCard({
    key: "pillager",
    cost: 5,
    name: "Pillagers",
  });
  static evoker = new CraftRoyaleCard({
    key: "evoker",
    cost: 3,
    name: "Evoker",
  });
  static vindicator = new CraftRoyaleCard({
    key: "vindicator",
    cost: 4,
    name: "Vindicator",
  });
  static piglin = new CraftRoyaleCard({
    key: "piglin",
    cost: 3,
    name: "Piglins",
  });
  static piglinBrute = new CraftRoyaleCard({
    key: "piglin_brute",
    cost: 6,
    name: "Piglin Brutes",
  });
  static witherSkeleton = new CraftRoyaleCard({
    key: "wither_skeleton",
    cost: 3,
    name: "Wither Skeleton",
  });
  static blaze = new CraftRoyaleCard({
    key: "blaze",
    cost: 2,
    name: "Blazes",
  });
  static zombifiedPiglin = new CraftRoyaleCard({
    key: "zombified_piglin",
    cost: 5,
    name: "Zombified Piglins",
  });
  static hoglin = new CraftRoyaleCard({
    key: "hoglin",
    cost: 4,
    name: "Hoglin",
  });
  static zoglin = new CraftRoyaleCard({
    key: "zoglin",
    cost: 3,
    name: "Zoglin",
  });
  static shulker = new CraftRoyaleCard({
    key: "shulker",
    cost: 4,
    name: "Shulker",
  });
  static drowned = new CraftRoyaleCard({
    key: "drowned",
    cost: 3,
    name: "Drowned",
  });
  static wolf = new CraftRoyaleCard({
    key: "wolf",
    cost: 7,
    name: "Wolfs",
  });
  static breeze = new CraftRoyaleCard({
    key: "breeze",
    cost: 2,
    name: "Breezes",
  });
  static phantom = new CraftRoyaleCard({
    key: "phantom",
    cost: 2,
    name: "Phantoms",
  });
  static bee = new CraftRoyaleCard({
    key: "bee",
    cost: 2,
    name: "Bees",
  });
  static goat = new CraftRoyaleCard({
    key: "goat",
    cost: 1,
    name: "Goats",
  });
  static kaboom = new CraftRoyaleCard({
    key: "kaboom",
    cost: 4,
    name: "Kaboom",
    enemySide: true,
  });
  static poison = new CraftRoyaleCard({
    key: "poison",
    cost: 4,
    name: "Poison",
    enemySide: true,
  });
  static camelHusk = new CraftRoyaleCard({
    key: "camel_husk",
    cost: 4,
    name: "Camel Husk",
  });
  static frog = new CraftRoyaleCard({
    key: "frog",
    cost: 1,
    name: "Frog",
  });

  /**
   *
   * @param {string} itemId
   * @returns {CraftRoyaleCard | undefined}
   */
  static getFromItemId(itemId) {
    for (const c of this.values) {
      if (itemId == c.itemId) {
        return c;
      }
    }
    return undefined;
  }

  /**@returns {CraftRoyaleCard[]} */
  static get values() {
    return [
      this.zombie,
      this.skeleton,
      this.creeper,
      this.ironGolem,
      this.spider,
      this.enderman,
      this.silverfish,
      this.snowGolem,
      this.witch,
      this.lightningBolt,
      this.arrow,
      this.vex,
      this.endermite,
      this.ghast,
      this.ravager,
      this.pillager,
      this.evoker,
      this.vindicator,
      this.piglin,
      this.piglinBrute,
      this.witherSkeleton,
      this.blaze,
      this.zombifiedPiglin,
      this.hoglin,
      this.zoglin,
      this.shulker,
      this.drowned,
      this.wolf,
      this.breeze,
      this.phantom,
      this.bee,
      this.kaboom,
      this.poison,
      this.camelHusk,
      this.frog,
    ];
  }

  get itemId() {
    return `${CraftRoyaleCard.prefix}${this.key}${CraftRoyaleCard.suffix}`;
  }

  get itemName() {
    return `[${this.cost}] ${this.name}`;
  }

  /**
   * @param {Object} config
   * @param {string} config.key
   * @param {string} config.name
   * @param {number} config.cost
   * @param {boolean} [config.enemySide=false]
   * @param {string | null} [config.icon=null]
   */
  constructor({ key, cost, name, enemySide = false, icon = null }) {
    /** @type {string} */
    this.key = key;
    /** @type {number} */
    this.cost = cost;
    /** @type {string} */
    this.name = name;
    /** @type {string} */
    this.icon = icon ? icon : `${key}${CraftRoyaleCard.suffix}`;
    /** @type {boolean} */
    this.enemySide = enemySide;
  }
}
