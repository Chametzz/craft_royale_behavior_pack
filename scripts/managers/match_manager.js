import {
  Entity,
  system,
  world,
  Vector3,
  Dimension,
  Player,
  ItemStack,
  ItemLockMode,
} from "@minecraft/server";
import { craftRoyaleCards } from "../data/craft_royale_card";

export class MatchManager {
  static time = 180;
  static suddenDeathTime = 120;

  static delay = 0;
  static timer = 0;
  static inProgress = false;
  static isSuddenDeath = false;

  /** @type {Map<string, string[]>} */
  static playerDecks = new Map();

  static lobbySpawn = { x: 0, y: 0, z: 0 };
  static blueSpawn = { x: 0, y: 0, z: 0 };
  static redSpawn = { x: 0, y: 0, z: 0 };
  static blueDirection = 0;
  static redDirection = 0;
  static blueKingSpawn = { x: 0, y: 0, z: 0 };
  static redKingSpawn = { x: 0, y: 0, z: 0 };
  static bluePrincessesSpawn = { x: 0, y: 0, z: 0 };
  static redPrincessesSpawn = { x: 0, y: 0, z: 0 };

  //updates
  static timerUpdater;
  static delayUpdater;

  //events
  static towerDieSub;

  static get timerLabel() {
    const minutes = Math.floor(this.timer / 60);
    const seconds = this.timer % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  //"original_spawn": list[number]
  //"blue_spawn": list[number]
  //"red_spawn": list[number]
  //"blue_direction": number
  //"red_direction", number
  //"blue_king_spawn": list[number]
  //"red_king_spawn": list[number]
  //"blue_princesses_spawn": list[list[number]]
  //"red_princesses_spawn": list[list[number]]
  /**
   *
   * @param {String} json
   */
  static startWithDelay(jsonString) {
    if (!this.inProgress) {
      //reseteo
      if (this.delayUpdater != undefined) {
        system.clearRun(this.delayUpdater);
      }

      this.delay = 5;

      for (const p of world.getPlayers()) {
        p.onScreenDisplay.setTitle(`${this.delay}`);
      }
      for (const entity of world.getDimension("overworld").getEntities()) {
        if (entity.typeId != "minecraft:player") {
          entity.kill();
        }
      }

      this.delayUpdater = system.runInterval(() => {
        this.delay -= 1;
        if (this.delay > 0) {
          for (const p of world.getPlayers()) {
            p.onScreenDisplay.setTitle(`${this.delay}`);
          }
          for (const entity of world.getDimension("overworld").getEntities()) {
            if (entity.typeId != "minecraft:player") {
              entity.kill();
            }
          }
        } else {
          for (const p of world.getPlayers()) {
            p.onScreenDisplay.setTitle("FIGHT!");
          }
          if (this.delayUpdater != undefined) {
            system.clearRun(this.delayUpdater);
          }
          this.start(jsonString);
        }
      }, 20);
    }
  }

  /**
   *
   * @param {String} json
   */
  static start(jsonString) {
    if (!this.inProgress) {
      try {
        let params = JSON.parse(jsonString);
        this.lobbySpawn = {
          x: params["lobby_spawn"][0],
          y: params["lobby_spawn"][1],
          z: params["lobby_spawn"][2],
        };
        this.blueSpawn = {
          x: params["blue_spawn"][0],
          y: params["blue_spawn"][1],
          z: params["blue_spawn"][2],
        };
        this.redSpawn = {
          x: params["red_spawn"][0],
          y: params["red_spawn"][1],
          z: params["red_spawn"][2],
        };
        this.blueDirection = params["blue_direction"];
        this.redDirection = params["red_direction"];
        this.blueKingSpawn = {
          x: params["blue_king_spawn"][0],
          y: params["blue_king_spawn"][1],
          z: params["blue_king_spawn"][2],
        };
        this.redKingSpawn = {
          x: params["red_king_spawn"][0],
          y: params["red_king_spawn"][1],
          z: params["red_king_spawn"][2],
        };
        this.bluePrincessesSpawn = params["blue_princesses_spawn"].map((p) => ({
          x: p[0],
          y: p[1],
          z: p[2],
        }));
        this.redPrincessesSpawn = params["red_princesses_spawn"].map((p) => ({
          x: p[0],
          y: p[1],
          z: p[2],
        }));
      } catch (error) {
        world.sendMessage(error);
        return;
      }

      let dimension = world.getDimension("overworld");

      //rules
      dimension.runCommand("gamerule doImmediateRespawn true");
      world.gameRules.pvp = true;

      //init timers
      this.delay = 5;
      this.timer = this.time;
      this.inProgress = true;
      this.isSuddenDeath = false;

      //spawns
      this.spawnKingTower(
        dimension,
        "blue_team",
        this.blueKingSpawn,
        this.blueDirection,
      );
      this.spawnKingTower(
        dimension,
        "red_team",
        this.redKingSpawn,
        this.redDirection,
      );
      for (const p of this.bluePrincessesSpawn) {
        this.spawnPrincessTower(dimension, "blue_team", p, this.blueDirection);
      }
      for (const p of this.redPrincessesSpawn) {
        this.spawnPrincessTower(dimension, "red_team", p, this.redDirection);
      }

      this.sendMessageTimer();

      //sendPlayers
      this.assignTeams();
      for (const p of world.getAllPlayers()) {
        this.sendPlayerToArena(p);
        this.registerPlayerDeck(p);
      }

      //events
      this.timerUpdater = system.runInterval(() => {
        this.updateTimer(1);
      }, 20);

      this.towerDieSub = (event) => {
        if (
          event.deadEntity.typeId == "craft_royale:princess_tower" ||
          event.deadEntity.typeId == "craft_royale:king_tower"
        ) {
          this.onTowerDie(event.deadEntity);
        }
      };
      world.afterEvents.entityDie.subscribe(this.towerDieSub);
    }
  }

  /**
   *
   * @param {Entity} tower
   */
  static onTowerDie(tower) {
    if (this.inProgress) {
      if (!this.isSuddenDeath) {
        if (tower.typeId == "craft_royale:king_tower") {
          if (tower.hasTag("red_team")) {
            this.setWinner("blue_team");
          } else if (tower.hasTag("blue_team")) {
            this.setWinner("red_team");
          }
        }
      } else {
        if (tower.hasTag("red_team")) {
          this.setWinner("blue_team");
        } else if (tower.hasTag("blue_team")) {
          this.setWinner("red_team");
        }
      }
    }
  }

  /**
   *
   * @param {number} deltaTime
   */
  static updateTimer(deltaTime) {
    if (this.inProgress) {
      this.timer -= deltaTime;
      this.sendMessageTimer();
      if (this.timer <= 0) {
        let dimension = world.getDimension("overworld");
        if (!this.isSuddenDeath) {
          let blueTowersCount = this.getTowerCount(dimension, "blue_team");
          let redTowersCount = this.getTowerCount(dimension, "red_team");

          if (blueTowersCount > redTowersCount) {
            this.setWinner("blue_team");
            return;
          } else if (redTowersCount > blueTowersCount) {
            this.setWinner("red_team");
            return;
          }

          this.isSuddenDeath = true;
          this.timer = this.suddenDeathTime;
          for (const p of world.getAllPlayers()) {
            p.onScreenDisplay.setTitle("§cSudden Death");
            p.onScreenDisplay.updateSubtitle("Get next crown to WIN");
          }
        } else {
          let blueTowers = this.getTowers(dimension, "blue_team");
          let redTowers = this.getTowers(dimension, "red_team");

          let blueLowestTowerHealth = Math.min(
            ...blueTowers.map(
              (t) => t.getComponent("minecraft:health").currentValue,
            ),
          );

          let redLowestTowerHealth = Math.min(
            ...redTowers.map(
              (t) => t.getComponent("minecraft:health").currentValue,
            ),
          );

          if (blueLowestTowerHealth > redLowestTowerHealth) {
            this.setWinner("blue_team");
          } else if (redLowestTowerHealth > blueLowestTowerHealth) {
            this.setWinner("red_team");
          } else {
            this.setDraw();
          }
        }
      }
    }
  }
  /**
   *
   * @param {Entity} entity
   */

  static sendMessageTimer() {
    for (const p of world.getAllPlayers()) {
      p.onScreenDisplay.setActionBar(this.timerLabel);
    }
  }

  /**
   *
   * @param {String} winner
   */
  static setWinner(teamKey) {
    this.disableEvents();

    const dimension = world.getDimension("overworld");
    const entities = dimension.getEntities();
    const players = dimension.getPlayers();

    for (const p of players) {
      p.setSpawnPoint({
        x: this.lobbySpawn.x,
        y: this.lobbySpawn.y,
        z: this.lobbySpawn.z,
        dimension: dimension,
      });
      p.removeTag("in_match");

      if (teamKey == "blue_team") {
        p.onScreenDisplay.setTitle("§9The Blue Team WINS!");
      } else if (teamKey == "red_team") {
        p.onScreenDisplay.setTitle("§cThe Red Team WINS!");
      }
      p.dimension.spawnParticle("minecraft:firework_particle", p.location);
    }

    for (const entity of entities) {
      if (!entity.hasTag(teamKey)) {
        entity.kill();
      }
    }

    system.runTimeout(() => {
      this.stop();
      for (const p of players) {
        if (p.hasTag(teamKey)) {
          this.sendPlayerToLobby(p);
        }
      }
    }, 100);
  }

  static setDraw() {
    this.stop();
    const dimension = world.getDimension("overworld");
    const entities = dimension.getEntities();
    const players = dimension.getPlayers();

    for (const p of players) {
      p.setSpawnPoint({
        x: this.lobbySpawn.x,
        y: this.lobbySpawn.y,
        z: this.lobbySpawn.z,
        dimension: dimension,
      });
    }

    for (const entity of entities) {
      entity.kill();
    }
  }

  static disableEvents() {
    if (this.delayUpdater != undefined) {
      system.clearRun(this.delayUpdater);
    }
    if (this.timerUpdater != undefined) {
      system.clearRun(this.timerUpdater);
    }
    if (this.towerDieSub) {
      world.afterEvents.entityDie.unsubscribe(this.towerDieSub);
      this.towerDieSub = undefined;
    }
  }

  static stop() {
    world.gameRules.pvp = false;
    this.clearAllPlayerDecks();
    if (!this.inProgress) {
      this.delay = 0;
      if (this.delayUpdater != undefined) {
        system.clearRun(this.delayUpdater);
      }
    }
    if (this.inProgress) {
      this.disableEvents();
      this.delay = 0;
      this.inProgress = false;
      this.timer = 0;
      this.isSuddenDeath = false;
      for (const p of world.getPlayers()) {
        this.sendPlayerToLobby(p);
      }
    }
  }

  /**
   * @param {Dimension} dimension
   * @param {String} teamKey
   * @param {{ x, y, z }} position
   */
  static spawnKingTower(dimension, teamKey, position, direction = 0) {
    let tower = dimension.spawnEntity("craft_royale:king_tower", position);
    tower.setRotation({ x: 0, y: direction });
    tower.addTag("in_match");
    tower.addTag(teamKey);
    tower.setProperty("craft_royale:team", teamKey == "red_team" ? 1 : 0);
    MatchManager.showHealthEntity(tower);
    //tower.triggerEvent(`craft_royale:add_${teamKey}`);
  }

  /**
   *
   * @param {String} teamKey
   * @param {{ x, y, z }} position
   */
  static spawnPrincessTower(dimension, teamKey, position, direction = 0) {
    let tower = dimension.spawnEntity("craft_royale:princess_tower", position);
    tower.setRotation({ x: 0, y: direction });
    tower.addTag("in_match");
    tower.addTag(teamKey);
    tower.setProperty("craft_royale:team", teamKey == "red_team" ? 1 : 0);
    MatchManager.showHealthEntity(tower);
    //tower.triggerEvent(`craft_royale:add_${teamKey}`);
  }

  /**
   *
   * @param {Dimension} dimension
   * @param {String} teamKey
   * @returns {number}
   */
  static getTowerCount(dimension, teamKey) {
    return (
      dimension.getEntities({
        type: "craft_royale:king_tower",
        tags: [teamKey],
      }).length +
      dimension.getEntities({
        type: "craft_royale:princess_tower",
        tags: [teamKey],
      }).length
    );
  }

  /**
   *
   * @param {Dimension} dimension
   * @param {String} teamKey
   * @returns {Entity[]}
   */
  static getTowers(dimension, teamKey) {
    return [
      ...dimension.getEntities({
        type: "craft_royale:king_tower",
        tags: [teamKey],
      }),
      ...dimension.getEntities({
        type: "craft_royale:princess_tower",
        tags: [teamKey],
      }),
    ];
  }

  /**
   *
   * @param {Player} player
   */
  static sendPlayerToLobby(player) {
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

    player.removeTag("blue_team");
    player.removeTag("red_team");
    player.removeTag("in_match");
    player.setSpawnPoint({
      x: this.lobbySpawn.x,
      y: this.lobbySpawn.y,
      z: this.lobbySpawn.z,
      dimension: player.dimension,
    });
    player.teleport(this.lobbySpawn, {
      dimension: player.dimension,
    });
  }

  /**
   *
   * @param {Player} player
   */
  static sendPlayerToArena(player) {
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

    if (player.hasTag("blue_team") || player.hasTag("red_team")) {
      player.addTag("in_match");
      if (player.hasTag("blue_team")) {
        player.setSpawnPoint({
          x: this.blueSpawn.x,
          y: this.blueSpawn.y,
          z: this.blueSpawn.z,
          dimension: player.dimension,
        });
        player.teleport(this.blueSpawn, { dimension: player.dimension });
        player.setRotation({ x: 0, y: this.blueDirection });
      } else {
        player.setSpawnPoint({
          x: this.redSpawn.x,
          y: this.redSpawn.y,
          z: this.redSpawn.z,
          dimension: player.dimension,
        });
        player.teleport(this.redSpawn, { dimension: player.dimension });
        player.setRotation({ x: 0, y: this.redDirection });
      }
    }
  }

  static assignTeams() {
    const players = world.getAllPlayers();

    const unassignedPlayers = [];
    let blueCount = 0;
    let redCount = 0;

    for (const p of players) {
      if (p.hasTag("blue_team")) {
        blueCount++;
      } else if (p.hasTag("red_team")) {
        redCount++;
      } else {
        unassignedPlayers.push(p);
      }
    }

    for (let i = unassignedPlayers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [unassignedPlayers[i], unassignedPlayers[j]] = [
        unassignedPlayers[j],
        unassignedPlayers[i],
      ];
    }

    for (const player of unassignedPlayers) {
      if (blueCount < redCount) {
        player.addTag("blue_team");
        player.triggerEvent("craft_royale:remove_teams");
        player.triggerEvent("craft_royale:add_blue_team");
        blueCount++;
      } else if (redCount < blueCount) {
        player.addTag("red_team");
        player.triggerEvent("craft_royale:remove_teams");
        player.triggerEvent("craft_royale:add_red_team");
        redCount++;
      } else {
        const randomTeam = Math.random() < 0.5 ? "blue_team" : "red_team";
        player.addTag(randomTeam);

        if (randomTeam === "blue_team") blueCount++;
        else redCount++;
      }
    }
  }
  /**
   *
   * @param {Player} player
   */
  static registerPlayerDeck(player) {
    if (!this.playerDecks.has(player.id)) {
      const inventory = player.getComponent("minecraft:inventory")?.container;
      if (!inventory) return;

      const cards = new Set();
      for (let i = 0; i < inventory.size; i++) {
        const item = inventory.getItem(i);
        if (item && item.typeId.startsWith("craft_royale_card:")) {
          cards.add(item.typeId);
        }
      }

      if (cards.size < 8) {
        const cardsAvailable = craftRoyaleCards.filter(
          (c) => !cards.has(c.itemId),
        );
        while (cards.size < 8 && cardsAvailable.length > 0) {
          const randomIndex = Math.floor(Math.random() * cardsAvailable.length);
          const [selectedCard] = cardsAvailable.splice(randomIndex, 1);
          cards.add(selectedCard.itemId);
        }
      }

      const deck = Array.from(cards).sort(() => Math.random() - 0.5);

      this.playerDecks.set(player.id, []);

      inventory.clearAll();

      for (let i = 0; i < deck.length; i++) {
        if (i < 4) {
          const item = new ItemStack(deck[i], 1);
          item.keepOnDeath = true;
          item.lockMode = ItemLockMode.slot;
          inventory.addItem(item);
        } else {
          this.playerDecks.get(player.id).push(deck[i]);
        }
      }
    }
  }
  /**
   *
   * @param {Player} player
   */
  static clearAllPlayerDecks() {
    const keys = Array.from(this.playerDecks.keys());
    for (const k of keys) {
      const player = world.getEntity(k);
      if (player && player instanceof Player) {
        const inventory = player.getComponent("minecraft:inventory")?.container;
        if (inventory) {
          for (let i = 0; i < inventory.size; i++) {
            const item = inventory.getItem(i);
            if (item && item.typeId.startsWith("craft_royale_card:")) {
              this.playerDecks.get(k).push(item.typeId);
            }
          }
          inventory.clearAll();
          for (const card of this.playerDecks.get(k)) {
            const item = new ItemStack(card, 1);
            inventory.addItem(item);
          }
        }
      }
      this.playerDecks.delete(k);
    }
  }

  /**
   *
   * @param {Entity} entity
   */
  static showHealthEntity(entity) {
    if (entity.hasTag("in_match") && entity.typeId == "minecraft:player")
      return;

    const health = entity.getComponent("minecraft:health");
    if (health) {
      const currentHealth = Math.max(0, Math.ceil(health.currentValue));
      const maxHealth = Math.ceil(health.effectiveMax);
      let teamNameTag = "";
      if (entity.hasTag("blue_team")) {
        teamNameTag = "§9Blue Team\n";
      } else if (entity.hasTag("red_team")) {
        teamNameTag = "§cRed Team\n";
      }
      entity.nameTag = `${teamNameTag}:heart: ${currentHealth}/${maxHealth}`;
    }
  }
}
