import { Player, world } from "@minecraft/server";

export class PlayerManager {
  /**
   *
   * @param {string | ((player: Player) => string | undefined)} title
   * @param {string | ((player: Player) => string | undefined)} [subtitle]
   */
  static displayTitle(title, subtitle) {
    const resolveText = (param, player) => {
      if (typeof param === "function") {
        return param(player);
      }
      return param;
    };

    for (const p of world.getPlayers()) {
      const titleText = resolveText(title, p);
      const subtitleText = resolveText(subtitle, p);

      if (subtitleText !== undefined) {
        p.onScreenDisplay.updateSubtitle(subtitleText);
      } else if (titleText !== undefined) {
        p.onScreenDisplay.setTitle(titleText);
      }
    }
  }

  /**
   *
   * @param {Player} player
   */
  static restorePlayer(player) {
    const healthComponent = player.getComponent("minecraft:health");
    if (healthComponent) {
      healthComponent.resetToMaxValue();
    }
    const hungerComponent = player.getComponent("minecraft:player.hunger");
    if (hungerComponent) {
      hungerComponent.setCurrentValue(20);
    }
    player.extinguishFire();
    player.resetLevel();
    player.runCommand("effect @s clear");
  }
}
