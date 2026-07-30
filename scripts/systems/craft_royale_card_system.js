import { GameMode, ItemLockMode, ItemStack, world } from "@minecraft/server";
import { craftRoyaleCards } from "../data/craft_royale_card.js";
import { MatchManager } from "../managers/match_manager";

world.afterEvents.itemUse.subscribe((event) => {
  const player = event.source;
  const item = event.itemStack;

  if (
    item.typeId == "minecraft:blaze_rod" &&
    player.getGameMode() == GameMode.Creative
  ) {
    const tags = player.getTags();
    for (const tag of tags) {
      player.removeTag(tag);
    }
    player.addTag("red_team");
    player.runCommand("title @s title §cTeam Red");
  }

  if (
    item.typeId == "minecraft:breeze_rod" &&
    player.getGameMode() == GameMode.Creative
  ) {
    const tags = player.getTags();
    for (const tag of tags) {
      player.removeTag(tag);
    }
    player.addTag("blue_team");
    player.runCommand("title @s title §9Team Blue");
  }
  if (player.hasTag("in_match") || player.getGameMode() == GameMode.Creative) {
    for (const card of craftRoyaleCards) {
      if (item.typeId == card.itemId) {
        const dimension = player.dimension;

        const raycastResult = player.getBlockFromViewDirection({});

        if (!raycastResult) return;
        const hitBlock = raycastResult.block;
        const face = raycastResult.face;

        const offsets = {
          Up: { x: 0, y: 1, z: 0 },
          Down: { x: 0, y: -1, z: 0 },
          North: { x: 0, y: 0, z: -1 },
          South: { x: 0, y: 0, z: 1 },
          East: { x: 1, y: 0, z: 0 },
          West: { x: -1, y: 0, z: 0 },
        };

        const offset = offsets[face] || { x: 0, y: 1, z: 0 };

        const targetLocation = {
          x: hitBlock.location.x + offset.x,
          y: hitBlock.location.y + offset.y,
          z: hitBlock.location.z + offset.z,
        };

        const target = {
          x: targetLocation.x + 0.5,
          y: targetLocation.y,
          z: targetLocation.z + 0.5,
        };

        let restrictedArea = false;
        if (player.hasTag("blue_team")) {
          restrictedArea = MatchManager.isPositionInsideBounds(
            target,
            MatchManager.getTowerBounds(dimension, "red_team"),
          );
        }

        if (player.hasTag("red_team")) {
          restrictedArea = MatchManager.isPositionInsideBounds(
            target,
            MatchManager.getTowerBounds(dimension, "blue_team"),
          );
        }

        if (player.level < card.elixirCost) {
          player.sendMessage("§cInsufficient elixir");
        }

        if (restrictedArea) {
          player.sendMessage("§cRestricted area");
        }

        if (
          !restrictedArea &&
          (player.level >= card.elixirCost ||
            player.getGameMode() == GameMode.Creative)
        ) {
          if (player.getGameMode() != GameMode.Creative) {
            player.addLevels(-card.elixirCost);
          }

          /**@type {Entity[]} */
          let entities = card.invoke(target, dimension);
          for (const entity of entities) {
            try {
              if (player.hasTag("blue_team")) {
                entity.nameTag = "§9Blue";
                entity.addTag("blue_team");
                entity.addTag("in_match");
                entity.setProperty("craft_royale:team", 0);
              } else if (player.hasTag("red_team")) {
                entity.nameTag = "§cRed";
                entity.addTag("red_team");
                entity.addTag("in_match");
                entity.setProperty("craft_royale:team", 1);
              }
            } catch (error) {
              player.sendMessage(`Error al invocar carta: ${error}`);
            }
            MatchManager.showHealthEntity(entity);
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
