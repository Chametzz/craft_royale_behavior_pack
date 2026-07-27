import { GameMode, ItemLockMode, ItemStack, world } from "@minecraft/server";
import { craftRoyaleCards } from "../data/craft_royale_card.js";
import { MatchManager } from "../managers/match_manager";

world.afterEvents.itemUse.subscribe((event) => {
  const player = event.source;
  const item = event.itemStack;

  if (player.hasTag("in_match") || player.getGameMode() == GameMode.Creative) {
    for (const card of craftRoyaleCards) {
      if (item.typeId == card.itemId) {
        const raycastResult = player.getBlockFromViewDirection({
          maxDistance: 10,
        });

        if (!raycastResult) return;

        const targetBlock = raycastResult.block;

        if (
          player.level >= card.elixirCost ||
          player.getGameMode() == GameMode.Creative
        ) {
          if (player.getGameMode() != GameMode.Creative) {
            player.addLevels(-card.elixirCost);
          }
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
                entity.nameTag = "§9Blue";
                entity.addTag("blue_team");
                entity.triggerEvent("craft_royale:add_blue_team");
              } else if (player.hasTag("red_team")) {
                entity.nameTag = "§cRed";
                entity.addTag("red_team");
                entity.triggerEvent("craft_royale:add_red_team");
              }
            } catch (error) {
              player.sendMessage(`Error al invocar carta: ${error}`);
            }
          }

          //CAMBIO DE CARTA
          if (MatchManager.playerDecks.has(player.id)) {
            const inventory = player.getComponent(
              "minecraft:inventory",
            )?.container;
            if (inventory) {
              const newCardTypeId = MatchManager.playerDecks
                .get(player.id)
                .shift();
              const newCard = new ItemStack(newCardTypeId, 1);
              newCard.keepOnDeath = true;
              newCard.lockMode = ItemLockMode.slot;
              MatchManager.playerDecks.get(player.id).push(item.typeId);
              inventory.setItem(player.selectedSlotIndex, newCard);
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
