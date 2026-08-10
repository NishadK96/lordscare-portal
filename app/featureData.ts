export type FeatureGroup = {
  id: string;
  title: string;
  summary: string;
  items: string[];
};

export const featureGroups: FeatureGroup[] = [
  { id: "daily", title: "Daily routines", summary: "Keep regular collections and repeatable account tasks moving.", items: ["Mystery Boxes and Daily Login Gifts", "VIP, Admin, Guild, and Turf Quests", "Guild Gifts and Adventure Log", "Vergeway daily collection"] },
  { id: "protection", title: "Account protection", summary: "Configure how the account responds when protection matters.", items: ["Shield preferences and redeploy timing", "Shelter behaviour and troop choice", "Recall gatherers when attacked", "Protection reactions and safeguards"] },
  { id: "growth", title: "Building and research", summary: "Set clear development priorities for steady account growth.", items: ["Building upgrade priorities", "Research progression", "Automatic help requests", "Configurable resource and speed-up use"] },
  { id: "army", title: "Army management", summary: "Choose what to train and the troop targets you want to reach.", items: ["Infantry, Ranged, and Cavalry training", "Total troop targets by type", "Trap training and repair", "Training speed-up preferences"] },
  { id: "resources", title: "Resources and map", summary: "Manage gathering, supplying, and common map actions.", items: ["Resource gathering preferences", "Resource supply and Guild Bank requests", "Cargo Ship exchanges", "Relocation, migration, and army recalls"] },
  { id: "hunting", title: "Monster hunting and heroes", summary: "Progress through hunting and hero activities with selected rules.", items: ["Monster Hunting preferences", "Hero Stages", "Colosseum activity", "Hunting and gift statistics"] },
  { id: "familiars", title: "Familiars and activities", summary: "Configure Familiar development and selected special activities.", items: ["Familiar development", "Pact merging", "Labyrinth and Kingdom Tycoon", "Treasure Trove and challenge activities"] },
  { id: "guild", title: "Guild tools", summary: "Support members and simplify frequently repeated guild work.", items: ["Guild Bank commands", "Sending and requesting helps", "Guild Showdown and event settings", "Guild Gift and member statistics"] },
];
