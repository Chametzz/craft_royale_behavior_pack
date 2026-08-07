# Craft Royale - Guía de Comandos del Juego

Este documento detalla los comandos de eventos de script disponibles para gestionar partidas y equipos en Craft Royale.

---

## Sintaxis de los Comandos

Todos los comandos de Craft Royale se ejecutan utilizando el comando nativo de Minecraft `/scriptevent`.

```text
/scriptevent <id_del_comando> [mensaje]
```

---

## Comandos de Gestión de Partida

### 1. Iniciar Partida
Inicia una nueva partida asignada a un jugador específico utilizando una configuración en formato JSON que especifica las coordenadas de la arena, puntos de aparición y equipos.

* **ID del Comando:** `craft_royale:start_match`
* **Sintaxis:**
  ```text
  /scriptevent craft_royale:start_match <NombreJugador> <Configuracion_JSON>
  ```
* **Parámetros:**
  * `<NombreJugador>`: El nombre exacto o selector del jugador (por ejemplo, `@p`, `"Steve"`). Si el nombre contiene espacios, debe escribirse entre comillas.
  * `<Configuracion_JSON>`: Objeto JSON válido que define las ubicaciones de la arena y parámetros de equipo.

* **Estructura de la Configuración JSON:**
  * `lobby_spawn`: Coordenadas del lobby principal (`x`, `y`, `z`).
  * `waiting_room`: Coordenadas de la sala de espera (`x`, `y`, `z`).
  * `king_zone_size`: Dimensiones del área del Rey (`x`, `z`).
  * `princess_zone_size`: Dimensiones del área de las torres de Princesa (`x`, `z`).
  * `team_data`: Arreglo con la configuración para `blue_team` y `red_team`:
    * `team_key`: Identificador del equipo (`"blue_team"` o `"red_team"`).
    * `spawn`: Punto de aparición del jugador (`x`, `y`, `z`).
    * `direction`: Ángulo de rotación al aparecer el jugador (en grados).
    * `king_spawn`: Coordenadas de la torre del Rey (`x`, `y`, `z`).
    * `princess_spawns`: Lista de coordenadas para las torres de Princesa.

* **Ejemplo:**
  ```text
  /scriptevent craft_royale:start_match @p {"lobby_spawn": {"x": 0.5, "y": 0, "z": 0.5}, "waiting_room": {"x": 37, "y": 20, "z": 23}, "king_zone_size": {"x": 30, "z": 100}, "princess_zone_size": {"x": 42, "z": 22}, "team_data": [{"team_key": "blue_team", "spawn": {"x": 16, "y": 0, "z": 23}, "direction": 270, "king_spawn": {"x": 11, "y": 0, "z": 23}, "princess_spawns": [{"x": 18, "y": 0, "z": 12}, {"x": 18, "y": 0, "z": 34}]}, {"team_key": "red_team", "spawn": {"x": 57, "y": 0, "z": 23}, "direction": 90, "king_spawn": {"x": 63, "y": 0, "z": 23}, "princess_spawns": [{"x": 56, "y": 0, "z": 34}, {"x": 56, "y": 0, "z": 12}]}]}
  ```

---

### 2. Detener Partida
Detiene la partida activa actual de forma inmediata.

* **ID del Comando:** `craft_royale:stop_match`
* **Sintaxis:**
  ```text
  /scriptevent craft_royale:stop_match
  ```
* **Parámetros:** Ninguno.
* **Ejemplo:**
  ```text
  /scriptevent craft_royale:stop_match
  ```

---

## Comandos de Gestión de Equipos

### 3. Agregar Jugador al Equipo Azul
Asigna el jugador especificado al Equipo Azul.

* **ID del Comando:** `craft_royale:add_blue_team`
* **Sintaxis:**
  ```text
  /scriptevent craft_royale:add_blue_team <NombreJugador>
  ```
* **Parámetros:**
  * `<NombreJugador>`: El nombre del jugador que se añadirá al Equipo Azul.
* **Ejemplo:**
  ```text
  /scriptevent craft_royale:add_blue_team Steve
  ```

---

### 4. Agregar Jugador al Equipo Rojo
Asigna el jugador especificado al Equipo Rojo.

* **ID del Comando:** `craft_royale:add_red_team`
* **Sintaxis:**
  ```text
  /scriptevent craft_royale:add_red_team <NombreJugador>
  ```
* **Parámetros:**
  * `<NombreJugador>`: El nombre del jugador que se añadirá al Equipo Rojo.
* **Ejemplo:**
  ```text
  /scriptevent craft_royale:add_red_team Alex
  ```

---

### 5. Remover Jugador de Equipos
Remueve al jugador especificado de su equipo actual y restablece el título en pantalla a "No Team".

* **ID del Comando:** `craft_royale:remove_teams`
* **Sintaxis:**
  ```text
  /scriptevent craft_royale:remove_teams <NombreJugador>
  ```
* **Parámetros:**
  * `<NombreJugador>`: El nombre del jugador al que se le removerá la asignación de equipo.
* **Ejemplo:**
  ```text
  /scriptevent craft_royale:remove_teams Steve
  ```