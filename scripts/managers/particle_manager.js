import { Dimension, MolangVariableMap, world } from "@minecraft/server";

export class SpawnManager {
  static #createColorVars(color) {
    const molangVars = new MolangVariableMap();
    molangVars.setColorRGBA("variable.color", {
      red: color.r,
      green: color.g,
      blue: color.b,
      alpha: color.a ?? 1.0,
    });
    return molangVars;
  }

  static spawn(
    dimension,
    location,
    particleIdentifier = "minecraft:potion_splash_particle",
    color = { r: 0, g: 0, b: 0 },
  ) {
    const molangVars = this.#createColorVars(color);
    dimension.spawnParticle(particleIdentifier, location, molangVars);
  }

  /**
   * @param {Dimension} dimension
   * @param {{x: number, y: number, z: number}} start
   * @param {{x: number, y: number, z: number}} end
   * @param {number} density
   * @param {string} particleIdentifier
   * @param {{r: number, g: number, b: number, a?: number}} color
   */
  static spawnLine(
    dimension,
    start,
    end,
    density = 10,
    particleIdentifier = "minecraft:potion_splash_particle",
    color = { r: 0, g: 0, b: 0 },
  ) {
    const molangVars = this.#createColorVars(color);

    for (let i = 0; i <= density; i++) {
      const t = i / density;

      const currentLoc = {
        x: start.x + (end.x - start.x) * t,
        y: start.y + (end.y - start.y) * t,
        z: start.z + (end.z - start.z) * t,
      };

      dimension.spawnParticle(particleIdentifier, currentLoc, molangVars);
    }
  }

  /**
   * @param {Dimension} dimension
   * @param {{x: number, y: number, z: number}} cornerA
   * @param {{x: number, y: number, z: number}} cornerB
   * @param {number} step
   * @param {string} particleIdentifier
   * @param {{r: number, g: number, b: number, a?: number}} color
   */
  static spawnArea(
    dimension,
    cornerA,
    cornerB,
    step = 1,
    particleIdentifier = "minecraft:potion_splash_particle",
    color = { r: 0, g: 0, b: 0 },
  ) {
    const molangVars = this.#createColorVars(color);

    const minX = Math.min(cornerA.x, cornerB.x);
    const maxX = Math.max(cornerA.x, cornerB.x);
    const minY = Math.min(cornerA.y, cornerB.y);
    const maxY = Math.max(cornerA.y, cornerB.y);
    const minZ = Math.min(cornerA.z, cornerB.z);
    const maxZ = Math.max(cornerA.z, cornerB.z);
    for (let x = minX; x <= maxX; x += step) {
      for (let y = minY; y <= maxY; y += step) {
        for (let z = minZ; z <= maxZ; z += step) {
          dimension.spawnParticle(particleIdentifier, { x, y, z }, molangVars);
        }
      }
    }
  }
}
