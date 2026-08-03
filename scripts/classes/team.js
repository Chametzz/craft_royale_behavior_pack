export class Team {
  static blue = new Team("blue_team", "§9", "Blue", 0);
  static red = new Team("red_team", "§c", "Red", 1);

  /**@returns {Team[]} */
  static get values() {
    return [this.blue, this.red];
  }

  get rivals() {
    return Team.values.filter((rivalTeam) => rivalTeam.key != this.key);
  }

  get nameWithColor() {
    return `${this.color}${this.name}`;
  }

  /**
   *
   * @param {string} key
   * @param {string} color
   */
  constructor(key, color, name, variant) {
    /**@type {string} */
    this.key = key;
    /**@type {string} */
    this.color = color;
    /**@type {string} */
    this.name = name;
    /**@type {number} */
    this.variant = variant;
  }

  /**
   *
   * @param {string} teamKey
   */
  static get(teamKey) {
    return this.values.find((t) => t.key == teamKey);
  }
}
