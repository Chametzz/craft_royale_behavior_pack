const JSZip = require("jszip");
const fs = require("fs");
const path = require("path");

const BP_DIRECTORY = path.join(__dirname, "..");
const RP_DIRECTORY = path.join(
  __dirname,
  "..",
  "..",
  "..",
  "development_resource_packs",
  "mob_royale",
);

const OUTPUT_NAME = "mob_royale";
const OUTPUT_DIRECTORY = path.join(__dirname, "..", "build");

const BP_ALLOWED = ["entities", "items", "scripts", "manifest.json"];
const RP_ALLOWED = [
  "entity",
  "models",
  "render_controllers",
  "textures",
  "manifest.json",
];

/**
 *
 * @param {JSZip} zip
 * @param {string} currentPath
 * @param {string} rootPath
 */
function addFolderToZip(
  zip,
  currentPath,
  rootPath = currentPath,
  allowedRootItems = null,
) {
  const items = fs.readdirSync(currentPath);

  for (const item of items) {
    const fullPath = path.join(currentPath, item);

    if (
      currentPath === rootPath &&
      allowedRootItems &&
      !allowedRootItems.includes(item)
    ) {
      continue;
    }

    const stat = fs.statSync(fullPath);
    const relativePath = path.relative(rootPath, fullPath);

    if (stat.isDirectory()) {
      addFolderToZip(zip, fullPath, rootPath, allowedRootItems);
    } else {
      const fileData = fs.readFileSync(fullPath);
      zip.file(relativePath, fileData);
    }
  }
}

async function createPackBuffer(sourceDir, allowedRootItems) {
  const zip = new JSZip();
  addFolderToZip(zip, sourceDir, sourceDir, allowedRootItems);
  return await zip.generateAsync({ type: "nodebuffer" });
}

async function exportAddon() {
  if (!fs.existsSync(OUTPUT_DIRECTORY)) {
    fs.mkdirSync(OUTPUT_DIRECTORY, { recursive: true });
  }

  const mcaddon = new JSZip();
  const bpBuffer = await createPackBuffer(BP_DIRECTORY, BP_ALLOWED);
  const rpBuffer = await createPackBuffer(RP_DIRECTORY, RP_ALLOWED);

  mcaddon.file(`${OUTPUT_NAME}_bp.mcpack`, bpBuffer);
  mcaddon.file(`${OUTPUT_NAME}_rp.mcpack`, rpBuffer);

  const mcaddonBuffer = await mcaddon.generateAsync({ type: "nodebuffer" });
  const outputPath = path.join(OUTPUT_DIRECTORY, `${OUTPUT_NAME}.mcaddon`);

  fs.writeFileSync(outputPath, mcaddonBuffer);
  console.log("Addon exported");
}

exportAddon();
