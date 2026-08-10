export type MonsterCategory = "Normal" | "Event" | "Special" | "Multiple Hit";
export type AttackType = "Magic" | "Physical";

export type MonsterHeroLineup = {
  mode: string;
  level: string;
  free: string[];
  paid: string[];
};

export type MonsterGear = {
  name: string;
  slot?: string;
};

export type Monster = {
  id: string;
  slug: string;
  name: string;
  category: MonsterCategory;
  categories: MonsterCategory[];
  monsterType: string;
  image?: string;
  thumbnail?: string;
  imageSource?: string;
  description?: string;
  damageType?: string;
  defensiveType?: string;
  strongAgainst: string[];
  weakAgainst: string[];
  recommendedAttackType?: AttackType;
  recommendedHeroes: string[];
  alternativeHeroes: string[];
  heroLineups: MonsterHeroLineup[];
  levels: number[];
  drops: string[];
  materials: string[];
  gearRelated: MonsterGear[];
  spawnInformation?: string;
  eventInformation?: string;
  tips: string[];
  sourceUrl: string;
};

export type HeroAsset = {
  name: string;
  image?: string;
  imageSource?: string;
  sourceUrl: string;
};
