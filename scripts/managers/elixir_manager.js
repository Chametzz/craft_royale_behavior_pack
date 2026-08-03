import { Player, system } from "@minecraft/server";

export class ElixirManager {
  static limit = 10;

  static updaterIds = [];
  /**
   *
   * @param {Player[]} players
   * @param {number} seconds
   */
  static addUpdater(players, multiplier) {
    const intervalTicks = Math.max(1, Math.round((2.8 / multiplier) * 20));

    const updaterId = system.runInterval(() => {
      for (const p of players) {
        if (p.isValid && p.level < this.limit) {
          p.addLevels(1);
        }
      }
    }, intervalTicks);
    this.updaterIds.push(updaterId);
    return updaterId;
  }

  static removeUpdater(updater) {
    const index = this.updaterIds.indexOf(updater);
    if (index !== -1) {
      system.clearRun(this.updaterIds[index]);
      this.updaterIds.splice(index, 1);
    }
  }

  static clearUpdaters() {
    for (const id of this.updaterIds) {
      system.clearRun(id);
    }
    this.updaterIds.length = 0;
  }

  static replaceUpdater(updaterId, players, multiplier) {
    const index = this.updaterIds.indexOf(updaterId);
    if (index === -1) return undefined;

    system.clearRun(updaterId);

    const intervalTicks = Math.max(1, Math.round((2.8 / multiplier) * 20));

    const newUpdaterId = system.runInterval(() => {
      for (const p of players) {
        if (p.isValid && p.level < this.limit) {
          p.addLevels(1);
        }
      }
    }, intervalTicks);

    this.updaterIds[index] = newUpdaterId;

    return newUpdaterId;
  }
}
