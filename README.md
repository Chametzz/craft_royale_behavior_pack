Hola lo de abajo lo cambié por lo de python jijiji  
Hay que agregar el código dentro de components para poder hacer que funcionen bien todos los mobs que estamos modificando
```json
"component_groups": {
  "craft_royale:blue_team": {
    "minecraft:type_family": {
      "family": ["blue_team", "zombie", "undead", "monster", "mob"]
    },
    "minecraft:behavior.nearest_attackable_target": {
      "priority": 2,
      "must_see": true,
      "within_radius": 25,
      "entity_types": [
        {
          "filters": {
            "AND": [
              {
                "test": "is_family",
                "subject": 1,
                "operator": 1,
                "value": "blue_team"
              }
            ]
          },
          "max_dist": 35
        }
      ]
    },
    "minecraft:behavior.hurt_by_target": {
      "priority": 1,
      "entity_types": {
        "filters": {
          "test": "is_family",
          "subject": 1,
          "operator": 1,
          "value": "blue_team"
        },
        "max_dist": 64
      }
    }
  },

  "craft_royale:red_team": {
    "minecraft:type_family": {
      "family": ["red_team", "zombie", "undead", "monster", "mob"]
    },
    "minecraft:behavior.nearest_attackable_target": {
      "priority": 2,
      "must_see": true,
      "within_radius": 25,
      "entity_types": [
        {
          "filters": {
            "AND": [
              {
                "test": "is_family",
                "subject": 1,
                "operator": 1,
                "value": "red_team"
              }
            ]
          },
          "max_dist": 35
        }
      ]
    },
    "minecraft:behavior.hurt_by_target": {
      "priority": 1,
      "entity_types": {
        "filters": {
          "test": "is_family",
          "subject": 1,
          "operator": 1,
          "value": "red_team"
        },
        "max_dist": 64
      }
    }
  }
}
```