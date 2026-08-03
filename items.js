const fs = require("fs");
const path = require("path");
const { CraftRoyaleCard } = require("./scripts/classes/craft_royale_card.js");

const outputDirectory = path.join(
  process.env.APPDATA,
  "Minecraft Bedrock",
  "Users",
  "Shared",
  "games",
  "com.mojang",
  "development_behavior_packs",
  "craft_royale",
  "items",
);

if (!fs.existsSync(outputDirectory)) {
  fs.mkdirSync(outputDirectory, { recursive: true });
}

CraftRoyaleCard.values.forEach((item) => {
  // Estructura oficial del ítem para Minecraft Bedrock (ej. formato 1.20+)
  const jsonContent = {
    format_version: "1.20.50",
    "minecraft:item": {
      description: {
        identifier: item.itemId,
        category: "equipment",
      },
      components: {
        "minecraft:icon": item.icon,
        "minecraft:display_name": {
          value: `[${item.cost}] ${item.name}`,
        },
        "minecraft:max_stack_size": 1,
      },
    },
  };

  const fileName = item.itemId.split(":")[1] + ".json";
  const filePath = path.join(outputDirectory, fileName);

  fs.writeFileSync(filePath, JSON.stringify(jsonContent, null, 2), "utf-8");
  console.log(`[✔] Generado automáticamente: ${fileName}`);
});

console.log("¡Todos los JSON de ítems se han actualizado con éxito!");
