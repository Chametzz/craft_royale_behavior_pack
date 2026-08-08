const fs = require("fs");
const path = require("path");
const { Team } = require("../scripts/classes/team.js");

const INPUT_DIRECTORY = path.join(__dirname, "..", "samples", "entities");
const OUTPUT_DIRECTORY = path.join(__dirname, "..", "entities");

const COMPONENTS_TO_REMOVE = {
  all: [
    "minecraft:behavior.nearest_attackable_target",
    "minecraft:behavior.hurt_by_target",
    "minecraft:behavior.defend_trusted_target",
    "minecraft:behavior.owner_hurt_by_target",
    "minecraft:behavior.owner_hurt_target",
    "minecraft:burns_in_daylight",
    "minecraft:zombify_properties",
    "minecraft:environment_sensor",
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
  ],
};

const COMPONENTS_TO_REPLACE = {
  all: {
    "minecraft:angry": {},
    "minecraft:behavior.eat_mob": {
      run_speed: 2,
      eat_animation_time: 0.3,
      pull_in_force: 2.5,
      reach_mob_distance: 6,
      eat_mob_sound: "tongue",
      loot_table: "loot_tables/entities/frog.json",
      priority: 0,
    },
  },
};

const COMPONENTS_TO_ADD = {
  all: {
    "minecraft:nameable": {
      always_show: true,
    },
    "minecraft:follow_range": { value: 128, max: 128 },
    "minecraft:behavior.nearest_attackable_target": {
      priority: 0,
      must_see: false,
      reselect_targets: true,
      target_search_height: 80,
      within_radius: 64,
      entity_types: [
        {
          filters: {
            //AND
            all_of: [
              //Entity in match
              {
                test: "has_tag",
                subject: "other",
                value: "in_match",
              },
              //Entities from other teams
              {
                any_of: [
                  ...Team.values.map((team) => ({
                    all_of: [
                      {
                        test: "has_tag",
                        value: team.key,
                      },
                      {
                        test: "has_tag",
                        subject: "other",
                        operator: "!=",
                        value: team.key,
                      },
                    ],
                  })),
                ],
              },
              //Win condition logic
              {
                any_of: [
                  {
                    all_of: [
                      { test: "has_tag", value: "win_condition" },
                      { test: "has_tag", subject: "other", value: "buildings" },
                    ],
                  },
                  { test: "has_tag", operator: "!=", value: "win_condition" },
                ],
              },
              //Skip tower logic
              {
                any_of: [
                  {
                    all_of: [
                      { test: "has_tag", value: "skip_tower" },
                      {
                        test: "is_family",
                        subject: "other",
                        operator: "!=",
                        value: "tower",
                      },
                    ],
                  },
                  { test: "has_tag", operator: "!=", value: "skip_tower" },
                ],
              },
              //Air logic
              {
                any_of: [
                  {
                    test: "has_tag",
                    subject: "other",
                    operator: "!=",
                    value: "air",
                  },
                  {
                    all_of: [
                      { test: "has_tag", subject: "other", value: "air" },
                      {
                        any_of: [
                          { test: "has_tag", value: "anti_air" },
                          { test: "has_tag", value: "air" },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          max_dist: 128,
        },
      ],
    },
    "minecraft:damage_sensor": {
      triggers: [
        {
          //No damage
          on_damage: {
            filters: {
              all_of: [
                {
                  any_of: [
                    ...Team.values.map((team) => ({
                      all_of: [
                        {
                          test: "has_tag",
                          value: team.key,
                        },
                        {
                          test: "has_tag",
                          subject: "other",
                          value: team.key,
                        },
                      ],
                    })),
                  ],
                },
              ],
            },
          },
          deals_damage: "no",
        },
        {
          cause: "fall",
          deals_damage: "no",
        },
      ],
    },
    "minecraft:behavior.avoid_mob_type": {
      priority: 1,
      max_dist: 4,
      walk_speed_multiplier: 1.2,
      sprint_speed_multiplier: 1.5,
      entity_types: [
        {
          filters: {
            all_of: [
              {
                test: "has_tag",
                value: "coward",
              },
              {
                test: "has_tag",
                subject: "other",
                value: "in_match",
              },
              {
                test: "is_family",
                subject: "other",
                operator: "!=",
                value: "tower",
              },
              {
                any_of: [
                  ...Team.values.map((team) => ({
                    all_of: [
                      {
                        test: "has_tag",
                        value: team.key,
                      },
                      {
                        test: "has_tag",
                        subject: "other",
                        operator: "!=",
                        value: team.key,
                      },
                    ],
                  })),
                ],
              },
            ],
          },
        },
      ],
    },
  },
};

const PROPERTIES_TO_ADD = {
  "mob_royale:team": {
    type: "int",
    default: 0,
    client_sync: true,
    range: [0, 1],
  },
};

function configComponents(
  componentMap,
  { add = true, replace = true, remove = true } = {},
) {
  if (remove) {
    for (const key of COMPONENTS_TO_REMOVE.all) {
      delete componentMap[key];
    }
  }

  if (replace) {
    for (const [key, value] of Object.entries(COMPONENTS_TO_REPLACE.all)) {
      if (key in componentMap) {
        componentMap[key] = value;
      }
    }
  }

  if (add) {
    for (const [key, value] of Object.entries(COMPONENTS_TO_ADD.all)) {
      componentMap[key] = value;
    }
  }
}

function configProperties(description) {
  const properties = (description["properties"] ??= {});
  for (const [key, value] of Object.entries(PROPERTIES_TO_ADD)) {
    properties[key] = value;
  }
}

function execute() {
  if (!fs.existsSync(INPUT_DIRECTORY)) {
    console.log("The input directory does not exist.");
    return;
  }

  if (!fs.existsSync(OUTPUT_DIRECTORY)) {
    fs.mkdirSync(OUTPUT_DIRECTORY, { recursive: true });
  }

  const files = fs
    .readdirSync(INPUT_DIRECTORY)
    .filter((fileName) => fileName.endsWith(".json"));

  for (const fileName of files) {
    const inputFilePath = path.join(INPUT_DIRECTORY, fileName);
    const outputFilePath = path.join(OUTPUT_DIRECTORY, fileName);

    const JsonString = fs.readFileSync(inputFilePath, "utf-8");
    const cleanJsonString = JsonString.replace(
      /\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm,
      "$1",
    );
    const jsonObject = JSON.parse(cleanJsonString);
    const entityData = jsonObject["minecraft:entity"];

    const description = entityData["description"];

    configProperties(description);

    const components = (entityData["components"] ??= {});
    const componentGroups = (entityData["component_groups"] ??= {});

    configComponents(components);

    for (const [key, value] of Object.entries(componentGroups)) {
      configComponents(value, { add: false });
    }

    fs.writeFileSync(
      outputFilePath,
      JSON.stringify(jsonObject, null, 2),
      "utf-8",
    );
    console.log(`Entity generated successfully: ${outputFilePath}`);
  }
}

execute();
