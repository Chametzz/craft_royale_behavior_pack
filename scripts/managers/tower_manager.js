import { Dimension, world } from "@minecraft/server";
import { Team } from "../classes/team";
import { TeamManager } from "./team_manager";

export class TowerManager {
  static kingZoneSize = { x: 0, z: 0 };
  static princessZoneSize = { x: 0, z: 0 };

  /**
   *
   * @param {"king" | "princess"} tower
   * @param {Team} team
   * @param {Dimension} dimension
   * @param {{ x: number, y: number, z: number }} position
   * @param {number} direction
   */
  static spawnTower(
    towerType,
    team,
    dimension,
    position,
    direction = 0,
    zoneSize = { x: 0, z: 0 },
  ) {
    let identifier;
    switch (towerType) {
      case "king":
        identifier = "mob_royale:king_tower";
        break;
      case "princess":
        identifier = "mob_royale:princess_tower";
        break;
      default:
        return;
    }
    const tower = dimension.spawnEntity(identifier, position, {
      initialRotation: direction,
    });
    TeamManager.addEntityToTeam(tower, team);
    tower.addTag("in_match");
    tower.addTag("buildings");
    tower.addTag("anti_air");
    tower.addTag("tower");
    tower.setProperty("mob_royale:team", team.variant);
    tower.setDynamicProperty("zone_size_x", zoneSize.x);
    tower.setDynamicProperty("zone_size_z", zoneSize.z);
    return tower;
  }

  /**
   *
   * @param {Dimension} dimension
   * @param {Team[] | undefined} teams
   */
  static getTowers(dimension, teams) {
    const options = teams
      ? {
          tags: Array.from(teams, (team, i) => {
            return team.key;
          }),
        }
      : {};
    return dimension.getEntities({
      families: ["tower"],
      ...options,
    });
  }

  /**
   *
   * @param {Dimension} dimension
   * @param {Team[] | undefined} teams
   */
  static getTowerBounds(dimension, teams) {
    const towers = this.getTowers(dimension, teams);
    const bounds = [];
    for (const t of towers) {
      let size = {
        x: t.getDynamicProperty("zone_size_x") ?? 0,
        z: t.getDynamicProperty("zone_size_z") ?? 0,
      };
      const half = { x: size.x * 0.5, z: size.z * 0.5 };
      bounds.push({
        min: {
          x: t.location.x - half.x,
          z: t.location.z - half.z,
        },
        max: {
          x: t.location.x + half.x,
          z: t.location.z + half.z,
        },
      });
    }
    return bounds;
  }

  /**
   *
   * @param {Dimension} dimension
   * @param {Team[] | undefined} teams
   */
  static isInTowerArea(position, dimension, teams) {
    return this.getTowerBounds(dimension, teams).some(
      (b) =>
        position.x >= b.min.x &&
        position.x <= b.max.x &&
        position.z >= b.min.z &&
        position.z <= b.max.z,
    );
  }
}
