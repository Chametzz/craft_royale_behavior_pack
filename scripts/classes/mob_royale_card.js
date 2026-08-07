export class MobRoyaleCard {
  static prefix = "mob_royale_card:";
  static suffix = "_card";

  static zombie = new MobRoyaleCard({
    key: "zombie",
    cost: 2,
    name: "Zombies",
  });
  static skeleton = new MobRoyaleCard({
    key: "skeleton",
    cost: 3,
    name: "Skeletons",
  });
  static creeper = new MobRoyaleCard({
    key: "creeper",
    cost: 1,
    name: "Creeper",
  });
  static ironGolem = new MobRoyaleCard({
    key: "iron_golem",
    cost: 7,
    name: "Iron Golem",
  });
  static spider = new MobRoyaleCard({
    key: "spider",
    cost: 3,
    name: "Spiders",
  });
  static enderman = new MobRoyaleCard({
    key: "enderman",
    cost: 4,
    name: "Enderman",
  });
  static silverfish = new MobRoyaleCard({
    key: "silverfish",
    cost: 3,
    name: "Silverfishes",
  });
  static snowGolem = new MobRoyaleCard({
    key: "snow_golem",
    cost: 1,
    name: "Snow Golems",
  });
  static witch = new MobRoyaleCard({
    key: "witch",
    cost: 3,
    name: "Witch",
  });
  static lightningBolt = new MobRoyaleCard({
    key: "lightning_bolt",
    cost: 2,
    name: "Lightning Bolt",
    enemySide: true,
  });
  static arrow = new MobRoyaleCard({
    key: "arrow",
    cost: 3,
    name: "Arrows",
    enemySide: true,
  });
  static arrow = new MobRoyaleCard({
    key: "arrow",
    cost: 3,
    name: "Arrows",
    enemySide: true,
  });
  static vex = new MobRoyaleCard({
    key: "vex",
    cost: 2,
    name: "Vex",
  });
  static endermite = new MobRoyaleCard({
    key: "endermite",
    cost: 1,
    name: "Endermites",
  });
  static endermite = new MobRoyaleCard({
    key: "endermite",
    cost: 1,
    name: "Endermites",
  });
  static ghast = new MobRoyaleCard({
    key: "ghast",
    cost: 3,
    name: "Ghast",
  });
  static ravager = new MobRoyaleCard({
    key: "ravager",
    cost: 7,
    name: "Ravager",
  });
  static pillager = new MobRoyaleCard({
    key: "pillager",
    cost: 5,
    name: "Pillagers",
  });
  static evoker = new MobRoyaleCard({
    key: "evoker",
    cost: 3,
    name: "Evoker",
  });
  static vindicator = new MobRoyaleCard({
    key: "vindicator",
    cost: 4,
    name: "Vindicator",
  });
  static piglin = new MobRoyaleCard({
    key: "piglin",
    cost: 3,
    name: "Piglins",
  });
  static piglinBrute = new MobRoyaleCard({
    key: "piglin_brute",
    cost: 6,
    name: "Piglin Brutes",
  });
  static witherSkeleton = new MobRoyaleCard({
    key: "wither_skeleton",
    cost: 3,
    name: "Wither Skeleton",
  });
  static blaze = new MobRoyaleCard({
    key: "blaze",
    cost: 2,
    name: "Blazes",
  });
  static zombifiedPiglin = new MobRoyaleCard({
    key: "zombified_piglin",
    cost: 5,
    name: "Zombified Piglins",
  });
  static hoglin = new MobRoyaleCard({
    key: "hoglin",
    cost: 4,
    name: "Hoglin",
  });
  static zoglin = new MobRoyaleCard({
    key: "zoglin",
    cost: 3,
    name: "Zoglin",
  });
  static shulker = new MobRoyaleCard({
    key: "shulker",
    cost: 4,
    name: "Shulker",
  });
  static drowned = new MobRoyaleCard({
    key: "drowned",
    cost: 3,
    name: "Drowned",
  });
  static wolf = new MobRoyaleCard({
    key: "wolf",
    cost: 7,
    name: "Wolfs",
  });
  static breeze = new MobRoyaleCard({
    key: "breeze",
    cost: 2,
    name: "Breezes",
  });
  static phantom = new MobRoyaleCard({
    key: "phantom",
    cost: 2,
    name: "Phantoms",
  });
  static bee = new MobRoyaleCard({
    key: "bee",
    cost: 2,
    name: "Bees",
  });
  static goat = new MobRoyaleCard({
    key: "goat",
    cost: 1,
    name: "Goats",
  });
  static kaboom = new MobRoyaleCard({
    key: "kaboom",
    cost: 4,
    name: "Kaboom",
    enemySide: true,
  });
  static poison = new MobRoyaleCard({
    key: "poison",
    cost: 4,
    name: "Poison",
    enemySide: true,
  });
  static camelHusk = new MobRoyaleCard({
    key: "camel_husk",
    cost: 4,
    name: "Camel Husk",
  });
  static frog = new MobRoyaleCard({
    key: "frog",
    cost: 1,
    name: "Frog",
  });

  /**
   *
   * @param {string} itemId
   * @returns {MobRoyaleCard | undefined}
   */
  static getFromItemId(itemId) {
    for (const c of this.values) {
      if (itemId == c.itemId) {
        return c;
      }
    }
    return undefined;
  }

  /**@returns {MobRoyaleCard[]} */
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
    return `${MobRoyaleCard.prefix}${this.key}${MobRoyaleCard.suffix}`;
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
    this.icon = icon ? icon : `${key}${MobRoyaleCard.suffix}`;
    /** @type {boolean} */
    this.enemySide = enemySide;
  }
}
