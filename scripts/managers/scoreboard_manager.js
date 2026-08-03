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

    // 1. Obtener o crear el objetivo
    let objective = scoreboard.getObjective(objectiveId);
    if (!objective) {
      objective = scoreboard.addObjective(objectiveId, displayName);
    } else {
      // Si ya existe, actualizamos el título visible
      //objective.displayName = displayName;
    }

    // 2. Establecer como visible en el sidebar
    scoreboard.setObjectiveAtDisplaySlot(DisplaySlotId.Sidebar, {
      objective: objective,
    });

    // 3. Cargar o actualizar las líneas si se especificaron
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

    // Si se solicita, limpiamos los participantes antiguos para no acumular líneas sobrantes
    if (clearPrevious) {
      for (const participant of objective.getParticipants()) {
        objective.removeParticipant(participant);
      }
    }

    // Insertar/actualizar las nuevas líneas
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

    // Quitar del display slot lateral
    scoreboard.clearObjectiveAtDisplaySlot(DisplaySlotId.Sidebar);

    // Si se pasa un ID y se solicita eliminar la estructura NBT del mundo
    if (objectiveId && deleteObjective) {
      const objective = scoreboard.getObjective(objectiveId);
      if (objective) {
        scoreboard.removeObjective(objective);
      }
    }
  }
}
