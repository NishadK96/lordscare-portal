export type SetupField = {
  key: string;
  label: string;
  help?: string;
  type: "toggle" | "select" | "number" | "text" | "textarea" | "multiple";
  defaultValue: boolean | string | string[];
  options?: string[];
  warning?: string;
  placeholder?: string;
};

export type SetupCategory = {
  id: string;
  shortLabel: string;
  title: string;
  description: string;
  fields: SetupField[];
};

const toggle = (key: string, label: string, help: string, defaultValue = false, warning?: string): SetupField => ({ key, label, help, type: "toggle", defaultValue, warning });
const select = (key: string, label: string, options: string[], defaultValue = options[0]): SetupField => ({ key, label, type: "select", options, defaultValue });
const number = (key: string, label: string, placeholder = "Optional", defaultValue = ""): SetupField => ({ key, label, type: "number", defaultValue, placeholder });
const text = (key: string, label: string, placeholder = "Optional"): SetupField => ({ key, label, type: "text", defaultValue: "", placeholder });
const multiple = (key: string, label: string, options: string[], defaultValue: string[]): SetupField => ({ key, label, type: "multiple", options, defaultValue });

export const setupCategories: SetupCategory[] = [
  {
    id: "daily", shortLabel: "Daily", title: "Daily tasks and guild activity", description: "Routine collections, quests, rewards, and guild actions.",
    fields: [
      toggle("vergeway_daily_collection", "Vergeway daily collection", "Collect available daily Vergeway rewards.", true),
      toggle("mystery_box", "Mystery Box", "Collect mystery boxes when they appear."),
      toggle("admin_guild_quests", "Admin and Guild Quests", "Complete available Admin and Guild quests."),
      toggle("vip_quests_chests", "VIP quests and chests", "Collect available VIP quest rewards and chests."),
      toggle("turf_quests", "Turf Quests", "Collect completed turf quests."),
      toggle("daily_login_gift", "Daily Login Gift", "Collect the available daily login reward."),
      toggle("adventure_log", "Adventure Log", "Complete available Adventure Log quests."),
      toggle("send_guild_help", "Send guild help", "Automatically help guild members."),
      toggle("request_guild_help", "Request guild help", "Request help for construction and research."),
      toggle("collect_guild_gifts", "Collect Guild Gifts", "Open available guild gifts and clear opened entries.", true),
      toggle("collect_fortune_packets", "Collect Fortune Packets", "Collect packets while the guild event is active."),
      toggle("daily_missions", "Daily Missions", "Complete supported in-game daily missions."),
    ],
  },
  {
    id: "protection", shortLabel: "Protection", title: "Protection preferences", description: "Shield, anti-scout, shelter, and gathering-recall behavior.",
    fields: [
      toggle("always_shielded", "Always shielded", "Keep an active shield on the account.", true),
      toggle("shield_when_attacked", "Shield when attacked", "Deploy a shield when an enemy attack is detected."),
      toggle("shield_when_rallied", "Shield when rallied", "Deploy a shield when an enemy rally begins marching."),
      toggle("shield_when_scouted", "Shield when scouted", "Deploy a shield when a scout march is detected."),
      toggle("longer_shields_first", "Use longer shields first", "Prefer the longest available shield item."),
      select("shield_redeploy_minutes", "Shield redeploy threshold", ["5 minutes", "10 minutes", "15 minutes", "30 minutes"], "15 minutes"),
      select("shelter_behavior", "Shelter behavior", ["Do not shelter", "Always shelter", "Shelter when under attack"], "Always shelter"),
      select("shelter_troops", "Shelter troops", ["Hero and one troop", "Hero and best troops"], "Hero and best troops"),
      toggle("always_anti_scout", "Always Anti-Scout", "Maintain anti-scout while an item is available."),
      toggle("anti_scout_when_scouted", "Anti-Scout when scouted", "Deploy anti-scout after a scout march is detected."),
      toggle("recall_gatherers_attacked", "Recall gatherers if attacked", "Recall troops when their resource tile is attacked.", true),
      toggle("recall_gatherers_scouted", "Recall gatherers if scouted", "Recall troops when their resource tile is scouted."),
      toggle("recall_on_tile_conflict", "Recall on tile conflict", "Withdraw troops when another march conflicts with the target tile."),
      toggle("dont_shelter_siege", "Do not shelter siege", "Prioritize other troop types in the shelter."),
    ],
  },
  {
    id: "gathering", shortLabel: "Gathering", title: "Resource gathering", description: "Choose army limits, tile levels, resource types, and gathering rules.",
    fields: [
      select("gather_resources", "Gather resources", ["Enabled", "Disabled"], "Enabled"),
      select("max_gathering_armies", "Maximum gathering armies", ["Use all available", "1 army", "2 armies", "3 armies", "4 armies", "5 armies"]),
      multiple("gather_levels", "Allowed tile levels", ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5"], ["Level 3", "Level 4", "Level 5"]),
      multiple("gather_resource_types", "Resource types", ["Food", "Stone", "Wood", "Ore", "Gold", "Gems"], ["Food", "Stone", "Wood", "Ore", "Gold"]),
      toggle("leave_one_spare_army", "Leave one spare army", "Keep one army free for hunting or another activity."),
      toggle("gather_lowest_resource", "Prioritize lowest resource", "Prefer the allowed resource with the lowest castle amount."),
      toggle("ignore_gem_level", "Ignore level for gem lodes", "Allow any available gem-lode level."),
      toggle("only_clearable_tiles", "Only gather clearable tiles", "Prefer tiles the available army can fully clear."),
    ],
  },
  {
    id: "monsters", shortLabel: "Monsters", title: "Monster hunting", description: "Set hunt range, energy use, priority, and hero selection.",
    fields: [
      select("hunt_monsters", "Hunt monsters", ["Enabled", "Disabled"], "Enabled"),
      select("hunt_priority", "Hunt priority", ["Any", "Full health", "Lowest health", "Steal"]),
      select("hunt_energy_threshold", "Start above energy", ["25%", "50%", "75%", "80%", "100%"], "80%"),
      multiple("hunt_levels", "Monster levels to hunt", ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5"], ["Level 1", "Level 2"]),
      toggle("auto_select_hunt_heroes", "Auto-select heroes", "Use the bot's automatic hero selection for each monster.", true),
      toggle("use_energy_items", "Use energy items", "Use bag items to refill hunting energy.", false, "Uses inventory items"),
      toggle("use_winged_boots", "Use Winged Boots", "Increase march speed during supported hunts.", false, "Uses inventory items"),
      toggle("send_unfinished_to_chat", "Share unfinished monsters", "Post the location in guild chat if the monster cannot be finished."),
      toggle("combo_prediction", "Use combo prediction", "Estimate the hunt multiplier needed for the finishing attack."),
    ],
  },
  {
    id: "rallies", shortLabel: "Rallies", title: "Darknest rallies", description: "Configure Darknest rally joining, troop selection, and Dark Essence handling.",
    fields: [
      select("join_darknest_rallies", "Join Darknest rallies", ["Enabled", "Disabled"], "Enabled"),
      select("rally_limit", "Maximum active rallies", ["1", "2", "3", "4", "5"], "1"),
      select("rally_troop_mode", "Troops to send", ["Highest tier", "As recommended", "One troop"]),
      multiple("darknest_levels", "Darknest levels to join", ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5", "Level 6"], ["Level 1", "Level 2", "Level 3"]),
      toggle("dont_join_lab_full", "Do not join if lab is full", "Keep armies home when no Dark Essence space is available.", true),
      toggle("dont_fill_rally", "Do not fill rally", "Avoid sending enough troops to fill rally capacity."),
      toggle("dont_send_siege", "Do not send siege", "Exclude siege troops from Darknest rallies.", true),
      toggle("dont_send_t5", "Do not send T5", "Exclude T5 troops from Darknest rallies.", true),
      toggle("send_one_type", "Send one troop type", "Follow the rally leader's strongest troop ratio."),
      toggle("transmute_dark_essences", "Transmute Dark Essences", "Automatically transmute essences in the lab."),
    ],
  },
  {
    id: "growth", shortLabel: "Growth", title: "Buildings, research, and army", description: "Give precise progression and troop-training targets. Totals include troops already trained.",
    fields: [
      toggle("auto_build", "Auto Build", "Automatically start available building upgrades.", true),
      toggle("lowest_building_first", "Lowest level first", "Prefer lower-level buildings when building automatically.", true),
      select("building_priority", "Building priority", ["No priority", "Castle", "Academy", "Resource buildings", "Manor", "Barracks / Infirmary", "Monsterhold", "Familiars", "Trading Post", "Treasure Trove", "Workshop"], "Castle"),
      select("max_building_level", "Maximum building level", Array.from({ length: 25 }, (_, index) => String(index + 1)), "25"),
      text("building_instructions", "Building instructions", "Example: Focus on Infirmaries after Castle 25"),
      toggle("auto_research", "Auto Research", "Start research when no research is active.", true),
      toggle("research_target_system", "Use research target system", "Follow a target and complete its prerequisites.", true),
      text("research_tree", "Research tree", "Example: Military"),
      text("research_target", "Target research", "Example: Army Leadership"),
      number("research_target_level", "Target research level", "Example: 10"),
      toggle("use_technolabes", "Use Technolabes", "Instantly finish eligible research.", false, "Uses Technolabes; event points may not be gained"),
      text("minimum_research_might", "Minimum research might for Technolabes", "Example: 5M"),
      toggle("train_troops", "Train troops", "Enable automatic troop training.", true),
      toggle("rotate_troops", "Rotate troop types", "Rotate between the requested troop types."),
      select("troop_tier", "Troop tier", ["Highest unlocked", "T1", "T2", "T3", "T4", "T5"]),
      text("infantry_target", "Total Infantry target", "Example: 1M"),
      text("ranged_target", "Total Ranged target", "Example: 1M"),
      text("cavalry_target", "Total Cavalry target", "Example: 1M"),
      text("siege_target", "Total Siege target", "Example: 100K"),
      toggle("heal_troops", "Heal infirmary troops", "Automatically heal troops in the infirmary.", true),
      toggle("heal_sanctuary", "Heal Sanctuary", "Heal supported Sanctuary batches.", true),
      toggle("attack_trial_by_fire", "Attack Trial by Fire", "Complete supported Trial by Fire stages."),
      toggle("use_speedups", "Use Speed-Ups", "Allow configured queues to use speed-up items.", false, "Uses inventory items"),
      toggle("use_rss_from_bag", "Use resources from bag", "Use bag resources when required.", false, "Uses inventory items"),
    ],
  },
  {
    id: "heroes", shortLabel: "Heroes", title: "Heroes and familiars", description: "Configure hero progression, stages, Colosseum, pacts, and familiar development.",
    fields: [
      toggle("hire_new_heroes", "Hire new heroes", "Hire heroes when enough medals are available."),
      toggle("use_hero_exp", "Use hero EXP items", "Use available EXP items following hero priority.", false, "Uses inventory items"),
      toggle("upgrade_heroes", "Upgrade heroes", "Upgrade hero grade when medal requirements are met."),
      toggle("enhance_heroes", "Enhance heroes", "Equip hero items and increase hero rank."),
      toggle("auto_hero_stages", "Auto-attack Hero Stages", "Progress through configured Normal or Elite stages."),
      toggle("limited_hero_challenges", "Limited Hero Challenges", "Attempt supported limited challenges."),
      toggle("use_bravehearts", "Use Braveheart items", "Refill stamina for Hero Stages.", false, "Uses inventory items"),
      toggle("auto_colosseum", "Auto-attack Colosseum", "Use configured heroes for available attempts."),
      toggle("collect_arena_gems", "Collect Colosseum gems", "Collect available rank rewards."),
      toggle("open_pacts", "Open Pacts", "Open obtained familiar packs automatically.", true),
      toggle("merge_pacts", "Merge Pacts", "Merge configured pact types when available.", true),
      text("pacts_to_merge", "Pacts to merge", "Example: Pact 3 and Pact 4 (only unlocked pacts)"),
      toggle("train_familiars", "Train Familiars", "Train selected familiars in priority order.", true),
      toggle("distribute_heroes_evenly", "Distribute heroes evenly", "Spread heroes across available training slots.", true),
      number("daily_fragment_limit", "Daily fragment limit"),
      text("familiar_priority", "Familiar priority", "Example: Hoarder first, then Trickstar"),
      multiple("familiar_actions", "Familiar actions", ["Train", "Train Skills", "Use EXP Items", "Shatter Extra Runes", "Use Skills", "Upgrade Skills", "Enhance"], ["Train", "Train Skills", "Enhance"]),
      toggle("use_familiar_skills", "Use Familiar skills", "Use supported non-attack familiar skills when available."),
      toggle("enhance_familiars", "Enhance Familiars", "Use runes to improve selected familiar stages."),
    ],
  },
  {
    id: "events", shortLabel: "Events", title: "Events, Guild Fest, and artifacts", description: "Set event participation, reward collection, and free daily attempts.",
    fields: [
      number("guild_fest_min_points", "Guild Fest minimum points", "100", "100"),
      number("guild_fest_max_points", "Guild Fest maximum points", "999", "999"),
      toggle("guild_fest_collect_rewards", "Collect Guild Fest rewards", "Collect earned rewards using the documented priority."),
      toggle("guild_fest_complete_missions", "Complete Guild Fest missions", "Take supported missions within the points range."),
      toggle("guild_fest_buy_extra", "Buy extra Guild Fest mission", "Purchase another attempt after existing attempts are used.", false, "Costs 1,000 gems"),
      toggle("join_guild_showdown", "Join Guild Showdown", "Join with selected heroes, troops, and familiars."),
      toggle("appraise_artifacts", "Appraise Artifacts", "Appraise newly available artifacts."),
      toggle("collect_free_artifact_chests", "Collect free Artifact Chests", "Open available chests that do not cost coins."),
      toggle("buy_artifact_chests", "Buy Artifact Chests", "Spend Artifact Coins on configured chests.", false, "Spends Artifact Coins"),
      toggle("labyrinth_free_attempt", "Labyrinth free attempt", "Use only the available free daily attempt."),
      toggle("tycoon_free_attempt", "Kingdom Tycoon free attempt", "Use only the available free daily roll."),
    ],
  },
];

export function defaultSetupValues() {
  return Object.fromEntries(setupCategories.flatMap((category) => category.fields.map((field) => [field.key, field.defaultValue]))) as Record<string, boolean | string | string[]>;
}
