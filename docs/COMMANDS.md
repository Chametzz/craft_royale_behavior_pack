# Craft Royale - In-Game Commands Guide

This document details the available script event commands for managing matches and teams in Craft Royale.

---

## Command Syntax

All commands in Craft Royale are executed using Minecraft's built-in `/scriptevent` command.

```text
/scriptevent <command_id> [message]
```

---

## Match Management Commands

### 1. Start Match
Starts a new game match assigned to a specific player with a custom JSON configuration specifying map coordinates, spawns, and team rules.

* **Command ID:** `craft_royale:start_match`
* **Syntax:**
  ```text
  /scriptevent craft_royale:start_match <PlayerName> <JSON_Configuration>
  ```
* **Parameters:**
  * `<PlayerName>`: The exact name or target selector of the player (e.g., `@p`, `"Steve"`). Wrap in quotes if the name contains spaces.
  * `<JSON_Configuration>`: A valid JSON object defining arena locations and team parameters.

* **JSON Configuration Structure:**
  * `lobby_spawn`: Main lobby coordinates (`x`, `y`, `z`).
  * `waiting_room`: Waiting area coordinates (`x`, `y`, `z`).
  * `king_zone_size`: Dimensions for the King's territory (`x`, `z`).
  * `princess_zone_size`: Dimensions for the Princess towers territory (`x`, `z`).
  * `team_data`: Array containing configurations for `blue_team` and `red_team`:
    * `team_key`: Internal identifier (`"blue_team"` or `"red_team"`).
    * `spawn`: Player arena spawn point (`x`, `y`, `z`).
    * `direction`: Player spawn rotation angle in degrees.
    * `king_spawn`: King tower coordinates (`x`, `y`, `z`).
    * `princess_spawns`: List of coordinates for Princess towers.

* **Example:**
  ```text
  /scriptevent craft_royale:start_match @p {"lobby_spawn": {"x": 0.5, "y": 0, "z": 0.5}, "waiting_room": {"x": 37, "y": 20, "z": 23}, "king_zone_size": {"x": 30, "z": 100}, "princess_zone_size": {"x": 42, "z": 22}, "team_data": [{"team_key": "blue_team", "spawn": {"x": 16, "y": 0, "z": 23}, "direction": 270, "king_spawn": {"x": 11, "y": 0, "z": 23}, "princess_spawns": [{"x": 18, "y": 0, "z": 12}, {"x": 18, "y": 0, "z": 34}]}, {"team_key": "red_team", "spawn": {"x": 57, "y": 0, "z": 23}, "direction": 90, "king_spawn": {"x": 63, "y": 0, "z": 23}, "princess_spawns": [{"x": 56, "y": 0, "z": 34}, {"x": 56, "y": 0, "z": 12}]}]}
  ```

---

### 2. Stop Match
Stops the current active match immediately.

* **Command ID:** `craft_royale:stop_match`
* **Syntax:**
  ```text
  /scriptevent craft_royale:stop_match
  ```
* **Parameters:** None.
* **Example:**
  ```text
  /scriptevent craft_royale:stop_match
  ```

---

## Team Management Commands

### 3. Add Player to Blue Team
Assigns the specified player to the Blue Team.

* **Command ID:** `craft_royale:add_blue_team`
* **Syntax:**
  ```text
  /scriptevent craft_royale:add_blue_team <PlayerName>
  ```
* **Parameters:**
  * `<PlayerName>`: The name of the player to add to the Blue Team.
* **Example:**
  ```text
  /scriptevent craft_royale:add_blue_team Steve
  ```

---

### 4. Add Player to Red Team
Assigns the specified player to the Red Team.

* **Command ID:** `craft_royale:add_red_team`
* **Syntax:**
  ```text
  /scriptevent craft_royale:add_red_team <PlayerName>
  ```
* **Parameters:**
  * `<PlayerName>`: The name of the player to add to the Red Team.
* **Example:**
  ```text
  /scriptevent craft_royale:add_red_team Alex
  ```

---

### 5. Remove Player from Teams
Removes the specified player from their assigned team and resets their display title to "No Team".

* **Command ID:** `craft_royale:remove_teams`
* **Syntax:**
  ```text
  /scriptevent craft_royale:remove_teams <PlayerName>
  ```
* **Parameters:**
  * `<PlayerName>`: The name of the player whose team assignment should be cleared.
* **Example:**
  ```text
  /scriptevent craft_royale:remove_teams Steve
  ```