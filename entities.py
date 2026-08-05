import json
import os
import commentjson


class Team:
    def __init__(self, key, variant):
        self.key = key
        self.variant = variant


entity_folder = "samples/entities"
target_folder = "entities"

teams: list[Team] = [
    Team(
        "blue_team",
        0,
    ),
    Team("red_team", 1),
]

COMPONENTS_TO_CONFIG = {
    "minecraft:angry": {},
    "minecraft:behavior.ram_attack": {
        "priority": 1,
        "run_speed": 0.7,
        "ram_speed": 3,
        "min_ram_distance": 1,
        "ram_distance": 128,
        "knockback_force": 64,
        "knockback_height": 0.04,
        "pre_ram_sound": "pre_ram",
        "ram_impact_sound": "ram_impact",
        "cooldown_range": {"min": 1, "max": 2},
        "on_start": [{"event": "start_event", "target": "self"}],
    },
    "minecraft:behavior.eat_mob": {
        "run_speed": 2,
        "eat_animation_time": 0.3,
        "pull_in_force": 2.5,
        "reach_mob_distance": 6,
        "eat_mob_sound": "tongue",
        "loot_table": "loot_tables/entities/frog.json",
        "priority": 0,
    },
    "attack_cooldown": {
        "minecraft:attack_cooldown": {
            "attack_cooldown_time": [1, 2],
            "attack_cooldown_complete_event": {
                "event": "attack_cooldown_complete_event",
                "target": "self",
            },
        }
    },
}

COMPONENTS_TO_REMOVE = [
    "minecraft:behavior.nearest_attackable_target",
    "minecraft:behavior.hurt_by_target",
    "minecraft:behavior.defend_trusted_target",
    "minecraft:behavior.owner_hurt_by_target",
    "minecraft:behavior.owner_hurt_target",
    "minecraft:burns_in_daylight",
    "minecraft:zombify_properties",
    "minecraft:environment_sensor",  # Remueve sensores de luz/clima que las vuelven neutrales
    "minecraft:cannot_be_attacked",
    "minecraft:behavior.nearest_prioritized_attackable_target",
    "minecraft:despawn",
    "minecraft:hurt_when_wet",
    "minecraft:behavior.avoid_mob_type",
    "minecraft:behavior.nearest_attackable_target_or_retaliate",
    "minecraft:damage_condition",
    "minecraft:behavior.panic",
    "minecraft:experience_reward",
    "minecraft:behavior.avoid_block",
]

team_components = {}
team_component_groups = {}
team_events = {}
team_properties = {}

# team_components["minecraft:type_family"] = {"family": []}
team_components["minecraft:follow_range"] = {"value": 128, "max": 128}
team_components["minecraft:damage_sensor"] = {
    "triggers": [
        {"on_damage": {"filters": {"any_of": []}}, "deals_damage": "no"},
        {"cause": "fall", "deals_damage": "no"},
    ]
}

team_components["minecraft:behavior.nearest_attackable_target"] = {
    "priority": 0,
    "must_see": False,
    "reselect_targets": True,
    "target_search_height": 80,
    "within_radius": 64,
    "entity_types": [
        {"filters": {"all_of": [{"any_of": []}, {"any_of": []}]}, "max_dist": 128}
    ],
}

team_components["minecraft:behavior.nearest_attackable_target"]["entity_types"][0][
    "filters"
]["all_of"][0]["any_of"].extend(
    [
        # CASO 1: Es una Win Condition (SOLO ataca estructuras)
        {
            "all_of": [
                {"test": "has_tag", "value": "win_condition"},
                {
                    "any_of": [
                        {"test": "has_tag", "subject": "other", "value": "buildings"},
                        {"test": "is_family", "subject": "other", "value": "tower"},
                    ]
                },
            ]
        },
        # CASO 2: Tiene la tag 'skiptower' (Ataca todo MENOS a la family 'tower')
        {
            "all_of": [
                {"test": "has_tag", "value": "skiptower"},
                {
                    "test": "is_family",
                    "operator": "!=",
                    "subject": "other",
                    "value": "tower",
                },
            ]
        },
        # CASO 3: Tropas Anti-Aire (No win_condition, no skiptower)
        {
            "all_of": [
                {
                    "test": "has_tag",
                    "operator": "!=",
                    "value": "win_condition",
                },
                {
                    "test": "has_tag",
                    "operator": "!=",
                    "value": "skiptower",
                },
                {"test": "has_tag", "value": "anti_air"},
                {
                    "test": "has_tag",
                    "subject": "other",
                    "value": "air",
                },
            ]
        },
        # CASO 4: Tropas Terrestres Normales (No win_condition, no skiptower, no objetivo aire)
        {
            "all_of": [
                {
                    "test": "has_tag",
                    "operator": "!=",
                    "value": "win_condition",
                },
                {
                    "test": "has_tag",
                    "operator": "!=",
                    "value": "skiptower",
                },
                {
                    "test": "has_tag",
                    "operator": "!=",
                    "subject": "other",
                    "value": "air",
                },
            ]
        },
    ]
)

avoid_entity_types = []
for t in teams:
    for enemy_team in teams:
        if enemy_team.key != t.key:
            avoid_entity_types.append(
                {
                    "filters": {
                        "all_of": [
                            {"test": "has_tag", "value": "coward"},  # Yo soy coward
                            {"test": "has_tag", "value": t.key},  # Mi equipo
                            {
                                "test": "is_family",
                                "operator": "!=",
                                "subject": "other",
                                "value": "tower",
                            },
                            {
                                "test": "has_tag",
                                "subject": "other",
                                "value": enemy_team.key,
                            },  # Equipo enemigo
                            {
                                "test": "has_tag",
                                "subject": "other",
                                "value": "in_match",
                            },  # Está en partida
                        ]
                    },
                    "max_dist": 16,
                }
            )

team_components["minecraft:behavior.avoid_mob_type"] = {
    "priority": 1,
    "max_dist": 4,
    "walk_speed_multiplier": 1.2,
    "sprint_speed_multiplier": 1.5,
    "entity_types": avoid_entity_types,
}

team_components["minecraft:nameable"] = {"always_show": True}
team_properties["craft_royale:team"] = {
    "type": "int",
    "default": 0,
    "client_sync": True,
    "range": [0, 1],
}

team_events["craft_royale:remove_teams"] = {"remove": {"component_groups": []}}

"""team_components["minecraft:damage_sensor"]["triggers"][0]["on_damage"]["filters"][
    "any_of"
].append(
    {
        "all_of": [
            {"test": "is_family", "value": "tower"},
            {"test": "has_tag", "subject": "other", "value": "spell"},
        ]
    }
)"""

for t in teams:
    # Evitar fuego amigo
    team_components["minecraft:damage_sensor"]["triggers"][0]["on_damage"]["filters"][
        "any_of"
    ].append(
        {
            "all_of": [
                {"test": "has_tag", "value": t.key},
                {"test": "has_tag", "subject": "other", "value": t.key},
            ]
        }
    )

    # Tropas normales
    team_components["minecraft:behavior.nearest_attackable_target"]["entity_types"][0][
        "filters"
    ]["all_of"][1]["any_of"].extend(
        [
            {
                "all_of": [
                    {"test": "has_tag", "value": t.key},
                    {"test": "has_tag", "subject": "other", "value": enemy_team.key},
                    {"test": "has_tag", "subject": "other", "value": "in_match"},
                ]
            }
            for enemy_team in teams
            if enemy_team.key != t.key
        ]
    )


def apply_component_configs(comp_dict: dict):
    """Aplica configuraciones personalizadas/modificaciones a componentes si existen."""
    for comp_name, rules in COMPONENTS_TO_CONFIG.items():
        if comp_name in comp_dict and isinstance(comp_dict[comp_name], dict):
            for key, val in rules.items():
                if val is None:
                    comp_dict[comp_name].pop(key, None)
                else:
                    comp_dict[comp_name][key] = val


def clean_components(comp_dict: dict):
    apply_component_configs(comp_dict)

    for comp in COMPONENTS_TO_REMOVE:
        comp_dict.pop(comp, None)

    for key, newComp in COMPONENTS_TO_CONFIG.items():
        if key in comp_dict:
            comp_dict[key] = newComp


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
                data = commentjson.load(f)
            if "minecraft:entity" not in data:
                print(
                    f"Omitiendo '{file_name}': No contiene la clave 'minecraft:entity'."
                )
                continue

            entity_data: dict = data["minecraft:entity"]
            components: dict = entity_data.setdefault("components", {})
            component_groups: dict = entity_data.setdefault("component_groups", {})
            properties: dict = entity_data["description"].setdefault("properties", {})
            events: dict = entity_data.setdefault("events", {})

            # Limpiar componentes principales
            clean_components(components)

            # Limpiar grupo de componentes
            for group in component_groups.values():
                if isinstance(group, dict):
                    clean_components(group)

            # Limpiar dentro de TODOS los component_groups (donde vivían las conductas de la araña)
            for group in component_groups.values():
                if isinstance(group, dict):
                    clean_components(group)

            # Inyectar configuraciones de equipos
            components.update(team_components)
            component_groups.update(team_component_groups)
            events.update(team_events)
            properties.update(team_properties)

            with open(output_file_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)

            print(f"Entidad generada: {output_file_path}")
        except Exception as e:  # noqa: BLE001
            print(f"Error al procesar '{file_name}': {e}")
    print("¡Proceso finalizado con éxito!")


run()
