import { Entity, Player, Scoreboard, system, world } from "@minecraft/server";
import { TeamManager } from "./team_manager.js";
import { PlayerManager } from "./player_manager.js";
import { TextStyle } from "../enums/text_style.js";
import { Team } from "../classes/team.js";
import { ElixirManager } from "./elixir_manager.js";
import { keysToCamelCase } from "../utils/keys_to_camel_case.js";
import { TowerManager } from "./tower_manager.js";
import { ScoreboardManager } from "./scoreboard_manager.js";
import { removeFirst } from "../utils/remove_first.js";
import { CraftRoyaleCardManager } from "./craft_royale_card_manager.js";

/**
 * @typedef {Object} MatchManagerConstructor
 * @property {{ x: number, y: number, z: number }} lobbySpawn
 * @property {{ x: number, z: number }} kingZoneSize
 * @property {{ x: number, z: number }} princessZoneSize
 */

/**
 * @typedef {Object} TeamData
 * @property {Team} team
 * @property {{ x: number, y: number, z: number }} lobbySpawn
 * @property {{ x: number, y: number, z: number }} spawn
 * @property { number } direction
 * @property {{ x: number, y: number, z: number }} kingSpawn
 * @property {{ x: number, y: number, z: number }[]} princessSpawns
 * @property {Player[]} players
 * @property {Entity[]} towers
 * @property {number} crowns
 * @property {boolean} isLost
 */
export class MatchManager {
  /**@type {MatchManager | undefined} */
  static main;

  get timerLabel() {
    const minutes = Math.floor(this.timer / 60);
    const seconds = this.timer % 60;
    let color = TextStyle.Reset;
    if (this.timer <= 30) {
      if (this.timer % 2 == 0) {
        color = TextStyle.Red;
      }
    }
    return `${color}${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  get crownsLabel() {
    return `${Array.from(this.teamData.values())
      .map((tD) => `${tD.team.color}${tD.crowns}`)
      .join(`${TextStyle.Reset} - `)}`;
  }

  get scoreboard() {
    return {
      "§8--------------------": 6,
      [`§f ${this.isSuddenDeath ? "§6Overtime" : "§eTime left"}: §r${this.timerLabel}`]: 5,
      [`§d Elixir: x${this.elixirMultiplier}`]: 4,
      "§8--------------------§0": 3,
      [`${this.crownsLabel}`]: 2,
      "§8--------------------§r": 1,
    };
  }

  /**
   *
   * @param {MatchManagerConstructor} data
   * @param {() => void | undefined} onStop
   */
  constructor(data, onStop) {
    this.onStop = onStop;

    this.delay = 5;
    this.time = 180;
    this.suddenDeathTime = 120;

    this.lobbySpawn = data.lobbySpawn;
    world.setDefaultSpawnLocation(this.lobbySpawn);
    this.kingZoneSize = data.kingZoneSize;
    this.princessZoneSize = data.princessZoneSize;
    this.waitingRoom = data.waitingRoom;

    this.timer = 0;
    this.inProgress = false;
    this.isSuddenDeath = false;

    /**@type {Map<string, TeamData>} */
    this.teamData = new Map(
      data.teamData.map((t) => {
        const team = Team.get(t.teamKey);
        return [
          t.teamKey,
          {
            team: team,
            spawn: t.spawn,
            direction: t.direction,
            kingSpawn: t.kingSpawn,
            princessSpawns: t.princessSpawns,
            players: [],
            towers: [],
            crowns: 0,
            isLost: false,
          },
        ];
      }),
    );

    //lobby
    /**@type {Player[]} */
    this.players = [];

    //elixir
    /**@type {Map<string, number>} */
    this.elixirMultiplier;
    this.playerElixirMultipliers = new Map();

    //events
    this.timerUpdaterId = undefined;
    this.tiebreakerUpdaterId = undefined;
    this.towerDieEvent = (event) => {
      if (
        event.deadEntity.typeId == "craft_royale:princess_tower" ||
        event.deadEntity.typeId == "craft_royale:king_tower"
      ) {
        this.onTowerDie(event.deadEntity);
      }
    };
  }

  /**
   *
   * @param {Player} p
   * @param {string} json
   */
  static startMatch(p, json) {
    if (!this.main) {
      this.main = new MatchManager(keysToCamelCase(JSON.parse(json)), () => {
        this.main = undefined;
      });
    }
    if (this.main && !this.main.inProgress) {
      this.main.addPlayer(p);
    }
  }

  static stopMatch() {
    if (this.main) {
      this.main.stop();
    }
  }

  /**
   *
   * @param {Player} player
   */
  addPlayer(player) {
    if (!this.inProgress) {
      this.players.push(player);
      player.teleport(this.waitingRoom);
      PlayerManager.lockInventory(player);

      if (this.timerUpdaterId) {
        system.clearRun(this.timerUpdaterId);
      }

      this.timer = this.delay;
      this.displayTimer();

      this.clearEntities();
      this.timerUpdaterId = system.runInterval(() => {
        this.updateTimer(1);
      }, 20);
    }
  }

  start() {
    this.timer = this.time;
    this.inProgress = true;

    //Asignar equipos a team data
    TeamManager.assignTeams(
      this.players,
      Array.from(this.teamData.values(), (tD, i) => tD.team),
    );

    for (const tD of this.teamData.values()) {
      tD.players = this.players.filter(
        (player) => TeamManager.getTeamFromEntity(player) === tD.team,
      );

      tD.towers.push(
        TowerManager.spawnTower(
          "king",
          tD.team,
          world.getDimension("overworld"),
          tD.kingSpawn,
          tD.direction,
          this.kingZoneSize,
        ),
      );

      for (const s of tD.princessSpawns) {
        tD.towers.push(
          TowerManager.spawnTower(
            "princess",
            tD.team,
            world.getDimension("overworld"),
            s,
            tD.direction,
            this.princessZoneSize,
          ),
        );
      }
    }

    world.afterEvents.entityDie.subscribe(this.towerDieEvent);

    this.updateElixir(1);

    this.sendPlayersToArena();

    this.displayFight();
    this.displayScoreboard();
  }

  startSuddenDeath() {
    this.timer = this.suddenDeathTime;
    this.isSuddenDeath = true;
    this.displaySuddenDeath();
    this.updateScoreboard();
  }

  clearEntities() {
    for (const e of world.getDimension("overworld").getEntities()) {
      if (e.typeId != "minecraft:player") {
        e.remove();
      }
    }
  }

  /**
   *
   * @param {number} deltaTime
   */
  updateTimer(deltaTime) {
    if (this.timer > 0) {
      this.timer -= deltaTime;

      if (!this.inProgress) {
        if (this.timer <= 0) {
          this.start();
        } else {
          this.displayTimer();
          this.clearEntities();
        }
      } else {
        this.damageBuildings();
        this.updateScoreboard();
        if (this.timer == 60) {
          this.updateElixir(this.elixirMultiplier + 1);
          this.display60SecondsLeft();
        }
        if (this.timer == 30) {
          this.display30SecondsLeft();
        }
        if (this.timer > 0 && this.timer <= 10) {
          let color = "";
          if (this.timer > 8) {
            color = TextStyle.Yellow;
          } else if (this.timer > 2) {
            color = TextStyle.Gold;
          } else {
            color = TextStyle.Red;
          }
          this.displayTimer(color);
        }

        if (!this.isSuddenDeath) {
          if (this.timer <= 0) {
            const topTeams = this.getTeamsWithMoreTowers();

            if (topTeams.length == 1) {
              for (const tD of this.teamData.values()) {
                if (tD.team.key !== topTeams[0].team.key) {
                  tD.isLost = true;
                }
              }
              this.determineWinner();
            } else {
              this.startSuddenDeath();
            }
          }
        } else {
          if (this.timer <= 0) {
            if (this.isDraw()) {
              this.setDraw();
            } else {
              this.displayTiebreaker();
              this.tiebreakerUpdaterId = system.runInterval(() => {
                for (const tD of this.teamData.values()) {
                  for (const tower of tD.towers) {
                    tower.applyDamage(1);
                  }
                }
              }, 1);
            }
          }
        }
      }
    }
  }

  stop() {
    try {
      ScoreboardManager.remove("craft_royale_scoreboard");
    } catch (error) {}
    this.clearEvents();
    this.sendPlayersToLobby();
    this.onStop();
  }

  clearEvents() {
    ElixirManager.clearUpdaters();
    if (this.timerUpdaterId !== undefined) {
      system.clearRun(this.timerUpdaterId);
    }
    if (this.tiebreakerUpdaterId !== undefined) {
      system.clearRun(this.tiebreakerUpdaterId);
    }
    world.afterEvents.entityDie.unsubscribe(this.towerDieEvent);
  }

  /**
   *
   * @param {number} multiplier
   */
  updateElixir(multiplier) {
    this.elixirMultiplier = multiplier;
    ElixirManager.clearUpdaters();
    this.playerElixirMultipliers.clear();
    const maxPlayersTeam = Math.max(
      ...Array.from(this.teamData.values(), (tD) => tD.players.length),
    );
    for (const data of this.teamData.values()) {
      const playerCount = Math.max(data.players.length, 1);
      const realMultiplier = (maxPlayersTeam / playerCount) * multiplier;
      ElixirManager.addUpdater(data.players, realMultiplier);
      for (const p of data.players) {
        this.playerElixirMultipliers.set(p.id, realMultiplier);
      }
    }
  }

  /**
   *
   * @param {Entity} tower
   */
  onTowerDie(tower) {
    if (this.inProgress) {
      const towerTeam = TeamManager.getTeamFromEntity(tower);
      if (!towerTeam) return;

      const tD = this.teamData.get(towerTeam.key);
      if (!tD) return;

      //Si no remueve una torre entonces no es nuestra torre, retornamos
      if (!removeFirst(tD.towers, (t, i) => t.id === tower.id)) return;

      // agregamos una corona al resto de equipos
      for (const otherTD of this.teamData.values()) {
        if (otherTD.team.key != tD.team.key) {
          otherTD.crowns += 1;
        }
      }
      this.updateScoreboard();
      this.displayCrowns();

      // Si se muere el rey se mueren las demás torres y el equipo pierde
      if (tower.typeId == "craft_royale:king_tower") {
        for (const t of tD.towers) {
          if (t.isValid) {
            t.kill();
          }
        }
        tD.isLost = true;
      }

      //Si se muere cualquier torre en muerte subita automáticamente pierden
      if (this.isSuddenDeath) {
        tD.isLost = true;
      }

      this.determineWinner();
    }
  }

  //determina quien ganó dependiendo si isLost es igual para el resto de equipos menos para uno
  determineWinner() {
    const survivors = Array.from(this.teamData.values()).filter(
      (tD) => !tD.isLost,
    );
    if (survivors.length != 1) return;

    this.clearEvents();

    const winner = survivors[0];

    for (const e of world.getDimension("overworld").getEntities()) {
      e.removeTag("in_match");
      e.runCommand("summon fireworks_rocket ~ ~ ~");
    }

    PlayerManager.displayTitle((p) => {
      p.playSound("horn.call.1");
      return `${winner.team.color}${winner.team.name} Team has WON!`;
    });

    system.runTimeout(() => {
      this.stop();
    }, 100);
  }
  /**
   *
   * @returns {TeamData[]}
   */
  getTeamsWithMoreTowers() {
    let maxTowers = -1;
    let topTeams = [];

    for (const teamData of this.teamData.values()) {
      if (teamData.isLost) continue;

      const aliveTowersCount = teamData.towers.filter((t) => t.isValid).length;

      if (aliveTowersCount > maxTowers) {
        maxTowers = aliveTowersCount;
        topTeams = [teamData];
      } else if (aliveTowersCount === maxTowers) {
        topTeams.push(teamData);
      }
    }

    return topTeams;
  }

  setDraw() {
    for (const e of world.getDimension("overworld").getEntities()) {
      e.removeTag("in_match");
    }

    this.clearEvents();

    PlayerManager.displayTitle("DRAW");

    system.runTimeout(() => {
      this.stop();
    }, 100);
  }

  isDraw() {
    const teamsLowestHp = [];

    for (const tD of this.teamData.values()) {
      if (tD.isLost) continue;

      const towersHp = tD.towers
        .filter((tower) => tower.isValid)
        .map((tower) => {
          const health = tower.getComponent("minecraft:health");
          return health ? health.currentValue : 0;
        });

      const lowestHp = towersHp.length > 0 ? Math.min(...towersHp) : 0;
      teamsLowestHp.push({ team: tD.team, lowestHp });
    }

    if (teamsLowestHp.length < 2) {
      return false;
    }

    teamsLowestHp.sort((a, b) => a.lowestHp - b.lowestHp);
    return teamsLowestHp[0].lowestHp === teamsLowestHp[1].lowestHp;
  }

  damageBuildings() {
    world
      .getDimension("overworld")
      .getEntities({ tags: ["buildings"], excludeFamilies: ["tower"] })
      .forEach((e) => e.applyDamage(1));
  }

  //send
  /**
   *
   * @param {Player} player
   */
  sendPlayerToLobby(player) {
    PlayerManager.restorePlayer(player);
    player.removeTag("in_match");
    player.teleport(this.lobbySpawn);
  }

  sendPlayersToLobby() {
    for (const p of world.getPlayers()) {
      this.sendPlayerToLobby(p);
      CraftRoyaleCardManager.clearDecks();
    }
  }

  sendPlayersToArena() {
    for (const tD of this.teamData.values()) {
      for (const p of tD.players) {
        PlayerManager.restorePlayer(p);
        p.addLevels(5);
        p.setSpawnPoint({
          x: tD.spawn.x,
          y: tD.spawn.y,
          z: tD.spawn.z,
          dimension: p.dimension,
        });
        p.teleport(tD.spawn, { rotation: { x: 0, y: tD.direction } });
        p.addTag("in_match");
        CraftRoyaleCardManager.addDeck(p);
      }
    }
  }

  //displayers
  displayTimer(color = "") {
    PlayerManager.displayTitle((p) => {
      p.playSound("random.click");
      return `${color}${this.timer}`;
    });
  }

  displayFight() {
    PlayerManager.displayTitle("FIGHT!", (p) => {
      if (this.playerElixirMultipliers.has(p.id)) {
        return `${TextStyle.LightPurple}x${this.playerElixirMultipliers.get(p.id)} Elixir`;
      }
      return undefined;
    });
    system.runTimeout(() => {
      for (const tD of this.teamData.values()) {
        world.getDimension("overworld").playSound("horn.call.0", tD.spawn);
      }
    }, 1);
  }

  displayCrowns() {
    PlayerManager.displayTitle((p) => {
      p.playSound("note.pling");
      p.playSound("entity.wither.break_block");
      return this.crownsLabel;
    });
  }

  display60SecondsLeft() {
    PlayerManager.displayTitle(
      `${TextStyle.LightPurple}60 ${TextStyle.Reset}Seconds Left`,
      (p) => {
        p.playSound("note.pling");
        if (this.playerElixirMultipliers.has(p.id)) {
          return `${TextStyle.LightPurple}x${this.playerElixirMultipliers.get(p.id)} Elixir`;
        }
        return undefined;
      },
    );
  }

  display30SecondsLeft() {
    PlayerManager.displayTitle((p) => {
      p.playSound("note.pling");
      return `${TextStyle.Yellow}30 ${TextStyle.Reset}Seconds Left`;
    });
  }

  displaySuddenDeath() {
    PlayerManager.displayTitle((p) => {
      p.playSound("horn.call.2");
      return `${TextStyle.Red}Sudden Death`;
    }, "Get next crown to WIN");
  }

  displayTiebreaker() {
    PlayerManager.displayTitle(`${TextStyle.Red}Tiebreaker!`, "Who will win?");
  }

  displayScoreboard() {
    ScoreboardManager.display(
      "craft_royale_scoreboard",
      `${TextStyle.Bold}${TextStyle.White}<< Craft ${TextStyle.Yellow}Royale >>`,
      this.scoreboard,
    );
  }

  updateScoreboard() {
    ScoreboardManager.update("craft_royale_scoreboard", this.scoreboard);
  }
}
