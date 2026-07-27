import json
import os


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

ATTACK_COMPONENTS_TO_REMOVE = [
    "minecraft:behavior.nearest_attackable_target",
    "minecraft:behavior.hurt_by_target",
    "minecraft:behavior.defend_trusted_target",
    "minecraft:behavior.owner_hurt_by_target",
    "minecraft:behavior.owner_hurt_target",
    "minecraft:burns_in_daylight",
    "minecraft:zombify_properties",
    "minecraft:environment_sensor",  # Remueve sensores de luz/clima que las vuelven neutrales
    "minecraft:cannot_be_attacked",
]

team_components = {}
team_component_groups = {}
team_events = {}
team_properties = {}

# team_components["minecraft:type_family"] = {"family": []}
team_components["minecraft:follow_range"] = {"value": 128, "max": 128}
team_components["minecraft:damage_sensor"] = {
    "triggers": [{"on_damage": {"filters": {"any_of": []}}, "deals_damage": "no"}]
}
team_components["minecraft:behavior.nearest_attackable_target"] = {
    "priority": 2,
    "must_see": True,
    "reselect_targets": True,
    "within_radius": 64,
    "entity_types": [{"filters": {"any_of": []}, "max_dist": 128}],
}
team_components["minecraft:nameable"] = {"always_show": True}
team_properties["craft_royale:team"] = {
    "type": "int",
    "default": 0,
    "client_sync": True,
    "range": [0, 1],
}

team_events["craft_royale:remove_teams"] = {"remove": {"component_groups": []}}

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

    # Para que ataque a otros equipos:
    team_components["minecraft:behavior.nearest_attackable_target"]["entity_types"][0][
        "filters"
    ]["any_of"].extend(
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


def clean_components(comp_dict: dict):
    """Limpia componentes indeseados e inhabilita el temporizador de calma en 'minecraft:angry'."""
    # 1. Eliminar componentes de ataque u hostilidad vanilla
    for comp in ATTACK_COMPONENTS_TO_REMOVE:
        comp_dict.pop(comp, None)

    # 2. Desactivar la des-agresividad en 'minecraft:angry'
    if "minecraft:angry" in comp_dict and isinstance(
        comp_dict["minecraft:angry"], dict
    ):
        angry_data = comp_dict["minecraft:angry"]
        angry_data.pop("calm_event", None)
        angry_data.pop("duration", None)
        angry_data.pop("duration_delta", None)


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
            component_groups: dict = entity_data.setdefault("component_groups", {})
            properties: dict = entity_data["description"].setdefault("properties", {})
            events: dict = entity_data.setdefault("events", {})

            # Limpiar componentes principales
            clean_components(components)

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
