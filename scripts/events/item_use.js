import { GameMode, world } from "@minecraft/server";
import { MobRoyaleCardManager } from "../managers/mob_royale_card_manager";
import { TeamManager } from "../managers/team_manager";
import { Team } from "../classes/team";

world.afterEvents.itemUse.subscribe((event) => {
  const player = event.source;
  const item = event.itemStack;
  MobRoyaleCardManager.invoke(
    item.typeId,
    player,
    TeamManager.getTeamFromEntity(player),
  );
  if (player.getGameMode() == GameMode.Creative) {
    if (item.typeId == "minecraft:blaze_rod") {
      TeamManager.addEntityToTeam(player, Team.red);
    } else if (item.typeId == "minecraft:breeze_rod") {
      TeamManager.addEntityToTeam(player, Team.blue);
    }
  }
});
