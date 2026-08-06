import { DisplaySlotId, world } from "@minecraft/server";

export class ScoreboardManager {
  /**
   *
   * @param {string} objectiveId
   * @param {string} displayName
   * @param {Record<string, number>} lines
   */
  static display(objectiveId, displayName, lines = {}) {
    const scoreboard = world.scoreboard;

    let objective = scoreboard.getObjective(objectiveId);
    if (!objective) {
      objective = scoreboard.addObjective(objectiveId, displayName);
    }

    scoreboard.setObjectiveAtDisplaySlot(DisplaySlotId.Sidebar, {
      objective: objective,
    });

    if (Object.keys(lines).length > 0) {
      this.update(objectiveId, lines);
    }
  }

  /**
   *
   * @param {string} objectiveId
   * @param {Record<string, number>} lines
   * @param {boolean} clearPrevious
   */
  static update(objectiveId, lines, clearPrevious = true) {
    const objective = world.scoreboard.getObjective(objectiveId);
    if (!objective) return;

    if (clearPrevious) {
      for (const participant of objective.getParticipants()) {
        objective.removeParticipant(participant);
      }
    }

    for (const [text, score] of Object.entries(lines)) {
      objective.setScore(text, score);
    }
  }

  /**
   *
   * @param {string} [objectiveId]
   * @param {boolean} deleteObjective
   */
  static remove(objectiveId, deleteObjective = true) {
    const scoreboard = world.scoreboard;

    scoreboard.clearObjectiveAtDisplaySlot(DisplaySlotId.Sidebar);

    if (objectiveId && deleteObjective) {
      const objective = scoreboard.getObjective(objectiveId);
      if (objective) {
        scoreboard.removeObjective(objective);
      }
    }
  }
}
