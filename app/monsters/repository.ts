import monsterData from "./monsters.json";
import heroData from "./heroes.json";
import type { HeroAsset, Monster, MonsterCategory } from "./types";

const monsters = (monsterData as Monster[]).toSorted((a, b) => a.name.localeCompare(b.name));
const heroAssets = new Map((heroData as HeroAsset[]).map((hero) => [hero.name.toLowerCase(), hero]));

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export const monsterRepository = {
  getAllMonsters(): Monster[] {
    return monsters;
  },

  getMonsterBySlug(slug: string): Monster | undefined {
    return monsters.find((monster) => monster.slug === slug);
  },

  searchMonsters(query: string): Monster[] {
    const normalized = normalize(query);
    if (!normalized) return monsters;
    return monsters.filter((monster) => [monster.name, monster.monsterType, monster.recommendedAttackType, ...monster.materials].some((value) => value?.toLowerCase().includes(normalized)));
  },

  getMonstersByCategory(category: MonsterCategory): Monster[] {
    return monsters.filter((monster) => monster.categories.includes(category));
  },

  getRelatedMonsters(monster: Monster, limit = 3): Monster[] {
    return monsters
      .filter((candidate) => candidate.slug !== monster.slug)
      .map((candidate) => ({
        monster: candidate,
        score: Number(candidate.category === monster.category) * 3 + Number(candidate.recommendedAttackType === monster.recommendedAttackType) * 2 + Number(candidate.damageType === monster.damageType),
      }))
      .sort((a, b) => b.score - a.score || a.monster.name.localeCompare(b.monster.name))
      .slice(0, limit)
      .map((entry) => entry.monster);
  },

  getHeroAsset(name: string): HeroAsset | undefined {
    return heroAssets.get(name.toLowerCase());
  },
};
