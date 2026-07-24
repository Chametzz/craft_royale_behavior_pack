import json
import os


class Team:
    def __init__(self, key, variant, tags: list[str]):
        self.key = key
        self.variant = variant
        self.tags = tags


entity_folder = "samples/entities"
target_folder = "entities"

teams: list[Team] = [
    Team(
        "blue_team",
        0,
        [
            "blue",
            "Blue",
            "azul",
            "Azul",
            "§9blue",
            "§9Blue",
            "§9azul",
            "§9Azul",
            "§1blue",
            "§1Blue",
            "§1azul",
            "§1Azul",
        ],
    ),
    Team(
        "red_team",
        1,
        [
            "red",
            "Red",
            "rojo",
            "Rojo",
            "§cred",
            "§cRed",
            "§crojo",
            "§cRojo",
            "§4red",
            "§4Red",
            "§4rojo",
            "§4Rojo",
        ],
    ),
]

ATTACK_COMPONENTS_TO_REMOVE = [
    "minecraft:behavior.nearest_attackable_target",
    "minecraft:behavior.hurt_by_target",
    "minecraft:behavior.defend_trusted_target",
    "minecraft:behavior.owner_hurt_by_target",
    "minecraft:behavior.owner_hurt_target",
]

team_components = {}

team_component_groups = {}

team_events = {}

team_components["minecraft:nameable"] = {
    "default_trigger": {"event": "craft_royale:remove_teams", "target": "self"},
    "name_actions": [],
}
team_events["craft_royale:remove_teams"] = {"remove": {"component_groups": []}}

for t in teams:
    team_components["minecraft:nameable"]["name_actions"].extend(
        [
            {"name_filter": tag, "on_named": {"event": f"craft_royale:add_{t.key}"}}
            for tag in t.tags
        ]
    )
    team_component_groups[f"craft_royale:{t.key}"] = {
        "minecraft:type_family": {"family": [t.key]},
        "minecraft:behavior.nearest_attackable_target": {
            "priority": 2,
            "must_see": True,
            "reselect_targets": True,
            "within_radius": 64,
            "entity_types": [
                {
                    "filters": {
                        "AND": [
                            {
                                "test": "is_family",
                                "subject": 1,
                                "operator": 1,
                                "value": t.key,
                            }
                        ],
                    },
                    "max_dist": 35,
                }
            ],
        },
    }
    team_events[f"craft_royale:add_{t.key}"] = {
        "add": {"component_groups": [f"craft_royale:{t.key}"]}
    }
    team_events[f"craft_royale:remove_{t.key}"] = {
        "remove": {"component_groups": [f"craft_royale:{t.key}"]}
    }
    team_events["craft_royale:remove_teams"]["remove"]["component_groups"].append(
        f"craft_royale:{t.key}"
    )


# procesar
def run():
    os.makedirs(target_folder, exist_ok=True)

    if not os.path.exists(entity_folder):
        print("No existe la carpeta de origen")
        return

    files = [f for f in os.listdir(entity_folder) if f.endswith(".json")]

    if not files:
        print("No hay archivos json")
        return

    for file_name in files:
        input_file_path = os.path.join(entity_folder, file_name)
        output_file_path = os.path.join(target_folder, file_name)

        try:
            with open(input_file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            if "minecraft:entity" not in data:
                print(
                    f"Omitiendo '{file_name}': No contiene la clave 'minecraft:entity'."
                )
                continue

            entity_data: dict = data["minecraft:entity"]
            components: dict = entity_data.setdefault("components", {})

            for comp in ATTACK_COMPONENTS_TO_REMOVE:
                components.pop(comp, None)

            component_groups: dict = entity_data.setdefault("component_groups", {})
            events: dict = entity_data.setdefault("events", {})

            components.update(team_components)
            component_groups.update(team_component_groups)
            events.update(team_events)

            with open(output_file_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)

            print(f"Entidad generada: {output_file_path}")
        except Exception as e:  # noqa: BLE001
            print(f"Error al procesar '{file_name}': {e}")
    print("¡Proceso finalizado con éxito")


run()
