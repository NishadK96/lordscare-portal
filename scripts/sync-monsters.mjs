import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const API = "https://lordsmobile.fandom.com/api.php";
const projectRoot = process.cwd();
const assetDirectory = path.join(projectRoot, "public", "monsters");
const heroAssetDirectory = path.join(projectRoot, "public", "heroes");
const dataFile = path.join(projectRoot, "app", "monsters", "monsters.json");
const heroDataFile = path.join(projectRoot, "app", "monsters", "heroes.json");
const categoryNames = ["Monsters", "Normal Monsters", "Multiple Hit Monsters", "One Hit Monsters", "Guild Event Monsters"];
const ignoredPages = new Set(["Monster", "Monster Hunting"]);

function slugify(value) {
  return value.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function getJson(params) {
  const url = new URL(API);
  for (const [key, value] of Object.entries({ format: "json", formatversion: "2", ...params })) url.searchParams.set(key, value);
  const response = await fetch(url, { headers: { "user-agent": "LordsCare monster guide data sync" } });
  if (!response.ok) throw new Error(`Wiki request failed (${response.status}) for ${url}`);
  return response.json();
}

function cleanWikiText(value = "") {
  return value
    .replace(/<!--.*?-->/gs, "")
    .replace(/\{\{[^{}]*\}\}/g, "")
    .replace(/\[\[(?:[^\]|]+\|)?([^\]]+)\]\]/g, "$1")
    .replace(/'{2,}/g, "")
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getTemplateValue(wikitext, key) {
  const match = wikitext.match(new RegExp(`\\|\\s*${key}\\s*=\\s*([^\\n|}]*)`, "i"));
  return cleanWikiText(match?.[1]);
}

function getSection(wikitext, titlePattern) {
  const match = wikitext.match(new RegExp(`==+[^\\n]*${titlePattern}[^\\n]*==+([\\s\\S]*?)(?=\\n==|$)`, "i"));
  return match?.[1]?.trim() ?? "";
}

function extractLinks(value) {
  return [...value.matchAll(/\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|[^\]]+)?\]\]/g)].map((match) => cleanWikiText(match[1]));
}

function extractHeroes(value) {
  const linked = extractLinks(value);
  const pictured = [...value.matchAll(/\{\{Pic 2\|\d+\|([^}|]+?)(?: Icon)?(?:\|[^}]*)?\}\}/gi)].map((match) => cleanWikiText(match[1].replace(/ Icon$/i, "")));
  return [...new Set([...linked, ...pictured])];
}

function parseHeroLineups(wikitext) {
  const section = wikitext.match(/==[^\n]*Hero Lineups?[^\n]*==([\s\S]*?)(?=\n==(?!=)|$)/i)?.[1]?.trim() ?? "";
  if (!section) return [];
  const lineups = [];
  const subsectionMatches = [...section.matchAll(/===\s*([^=\n]+?)\s*===([\s\S]*?)(?=\n===|$)/g)];
  const sections = subsectionMatches.length ? subsectionMatches.map((match) => ({ mode: cleanWikiText(match[1]), content: match[2] })) : [{ mode: "Standard", content: section }];
  for (const heroSection of sections) {
    let previousPaid = [];
    for (const block of heroSection.content.split(/\n\|-\s*\n/).slice(1)) {
      const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
      const levelLine = lines.find((line) => /^[!|]/.test(line) && /\d/.test(line) && !line.includes("[[") && !line.includes("{{Pic"));
      if (!levelLine) continue;
      const level = cleanWikiText(levelLine.replace(/^!/, "").replace(/^.*?\|(?=[^|]*$)/, ""));
      const heroCells = lines.filter((line) => line.startsWith("|") && (line.includes("[[") || line.includes("{{Pic")));
      if (!heroCells.length) continue;
      const parsedCells = heroCells.map(extractHeroes).filter((heroes) => heroes.length);
      const free = parsedCells[0] ?? [];
      const paid = parsedCells[1] ?? previousPaid;
      if (heroCells[1]?.includes("rowspan") && paid.length) previousPaid = paid;
      else if (parsedCells.length > 1) previousPaid = [];
      lineups.push({ mode: heroSection.mode, level, free: [...new Set(free)].slice(0, 5), paid: [...new Set(paid)].slice(0, 5) });
    }
  }
  return lineups.filter((lineup) => lineup.free.length || lineup.paid.length);
}

function parseMaterials(wikitext) {
  const section = getSection(wikitext, "Materials?");
  if (!section) return [];
  return [...new Set(section.split("\n").filter((line) => /^\s*\*/.test(line)).map((line) => {
    const afterTemplate = line.includes("}}") ? line.slice(line.lastIndexOf("}}") + 2) : line.replace(/^\s*\*\s*/, "");
    return cleanWikiText(afterTemplate) || cleanWikiText(line.replace(/^\s*\*\s*/, ""));
  }).filter(Boolean))];
}

function parseGear(wikitext) {
  const match = wikitext.match(/Used to craft:\s*\[\[(?:Equipment\/)?([^\]|]+)(?:\|([^\]]+))?\]\]/i);
  const name = cleanWikiText(match?.[2] || match?.[1]);
  return name ? [{ name, slot: "Equipment set" }] : [];
}

function parseDescription(wikitext, name) {
  const withoutTemplate = wikitext.replace(/^\{\{[\s\S]*?\}\}\s*/, "");
  const paragraph = withoutTemplate.split(/\n\s*\n/).find((entry) => entry.includes(`'''${name}'''`)) ?? withoutTemplate.split(/\n\s*\n/)[0];
  return cleanWikiText(paragraph);
}

function parseWeaknessText(wikitext) {
  const section = getSection(wikitext, "Monster Manual");
  return cleanWikiText(section.match(/Weak Against:\s*([\s\S]*?)(?=\n\s*\n|$)/i)?.[1]);
}

function recommendedAttack(weaknessText, huntingClass) {
  const text = `${weaknessText} ${huntingClass}`;
  if (/bring[^.!]*(magic|intelligence)|skills? that deal magic|magic (?:dmg|damage|attacks?)|magic attacks|intelligence heroes/i.test(text)) return "Magic";
  if (/bring[^.!]*(physical|agility|strength)|physical (?:dmg|damage|attacks?)|physical force|agility heroes|\bAgility\b|strength heroes/i.test(text)) return "Physical";
  return undefined;
}

function monsterTypeFor(title, memberships) {
  if (memberships["Normal Monsters"]?.has(title)) return { category: "Normal", monsterType: "Normal Monster" };
  if (memberships["Multiple Hit Monsters"]?.has(title)) return { category: "Multiple Hit", monsterType: "Multiple Hit Monster" };
  if (memberships["Guild Event Monsters"]?.has(title)) return { category: "Event", monsterType: "Guild Event Monster" };
  if (memberships["One Hit Monsters"]?.has(title)) return { category: "Special", monsterType: "One Hit Monster" };
  return { category: "Event", monsterType: "Event Monster" };
}

function sourcePageUrl(title) {
  return `https://lordsmobile.fandom.com/wiki/${encodeURIComponent(title.replaceAll(" ", "_"))}`;
}

async function downloadImage(source, slug, directory = assetDirectory, publicDirectory = "monsters") {
  if (!source) return undefined;
  const response = await fetch(source, { headers: { "user-agent": "LordsCare monster guide asset sync" } });
  if (!response.ok) return undefined;
  const contentType = response.headers.get("content-type") ?? "image/png";
  const extension = contentType.includes("webp") ? "webp" : contentType.includes("jpeg") ? "jpg" : contentType.includes("gif") ? "gif" : "png";
  const filename = `${slug}.${extension}`;
  try {
    await access(path.join(directory, filename));
    return `/${publicDirectory}/${filename}`;
  } catch {}
  await writeFile(path.join(directory, filename), Buffer.from(await response.arrayBuffer()));
  return `/${publicDirectory}/${filename}`;
}

await mkdir(assetDirectory, { recursive: true });
await mkdir(heroAssetDirectory, { recursive: true });

const memberships = {};
const allTitles = new Set();
for (const category of categoryNames) {
  const result = await getJson({ action: "query", list: "categorymembers", cmtitle: `Category:${category}`, cmlimit: "500" });
  const titles = result.query.categorymembers.filter((page) => page.ns === 0 && !ignoredPages.has(page.title)).map((page) => page.title);
  memberships[category] = new Set(titles);
  for (const title of titles) allTitles.add(title);
}

const titleList = [...allTitles].sort((a, b) => a.localeCompare(b));
const details = await getJson({
  action: "query",
  prop: "revisions|pageimages",
  rvprop: "content",
  rvslots: "main",
  piprop: "thumbnail|original",
  pithumbsize: "600",
  titles: titleList.join("|"),
});

const monsters = [];
for (const page of details.query.pages.sort((a, b) => a.title.localeCompare(b.title))) {
  const wikitext = page.revisions?.[0]?.slots?.main?.content ?? "";
  const slug = slugify(page.title);
  const heroLineups = parseHeroLineups(wikitext);
  const weaknessText = parseWeaknessText(wikitext);
  const huntingClass = getTemplateValue(wikitext, "hunting_party_class");
  const attack = recommendedAttack(weaknessText, huntingClass);
  const imageSource = page.thumbnail?.source || page.original?.source;
  const image = await downloadImage(imageSource, slug);
  const type = monsterTypeFor(page.title, memberships);
  const categories = [
    memberships["Normal Monsters"]?.has(page.title) && "Normal",
    memberships["Guild Event Monsters"]?.has(page.title) && "Event",
    memberships["One Hit Monsters"]?.has(page.title) && "Special",
    memberships["Multiple Hit Monsters"]?.has(page.title) && "Multiple Hit",
  ].filter(Boolean);
  const modeLineups = type.category === "Normal" && heroLineups.some((lineup) => lineup.mode === "Normal") ? heroLineups.filter((lineup) => lineup.mode === "Normal") : heroLineups;
  const freeHeroes = modeLineups.findLast((lineup) => lineup.free.length)?.free ?? [];
  const paidHeroes = modeLineups.findLast((lineup) => lineup.paid.length)?.paid ?? [];
  monsters.push({
    id: String(page.pageid),
    slug,
    name: page.title,
    ...type,
    categories,
    ...(image ? { image, thumbnail: image } : {}),
    ...(imageSource ? { imageSource } : {}),
    description: parseDescription(wikitext, page.title),
    damageType: getTemplateValue(wikitext, "dmg_type") || undefined,
    defensiveType: getTemplateValue(wikitext, "strong_against") || undefined,
    strongAgainst: getTemplateValue(wikitext, "strong_against") ? [getTemplateValue(wikitext, "strong_against")] : [],
    weakAgainst: weaknessText ? [weaknessText] : [],
    recommendedAttackType: attack,
    recommendedHeroes: freeHeroes,
    alternativeHeroes: paidHeroes,
    heroLineups,
    levels: type.category === "Normal" ? [1, 2, 3, 4, 5] : [],
    drops: [],
    materials: parseMaterials(wikitext),
    gearRelated: parseGear(wikitext),
    spawnInformation: type.category === "Normal" ? "Appears in the normal Kingdom Map monster rotation." : undefined,
    eventInformation: type.category !== "Normal" ? type.monsterType : undefined,
    tips: weaknessText ? [weaknessText] : [],
    sourceUrl: sourcePageUrl(page.title),
  });
}

await writeFile(dataFile, `${JSON.stringify(monsters, null, 2)}\n`);

const heroNames = [...new Set(monsters.flatMap((monster) => monster.heroLineups.flatMap((lineup) => [...lineup.free, ...lineup.paid])))].sort((a, b) => a.localeCompare(b));
const heroDetails = await getJson({ action: "query", prop: "pageimages", piprop: "thumbnail|original", pithumbsize: "240", titles: heroNames.join("|") });
const heroes = [];
for (const page of heroDetails.query.pages.filter((entry) => !entry.missing).sort((a, b) => a.title.localeCompare(b.title))) {
  const imageSource = page.thumbnail?.source || page.original?.source;
  const image = await downloadImage(imageSource, slugify(page.title), heroAssetDirectory, "heroes");
  heroes.push({ name: page.title, ...(image ? { image } : {}), ...(imageSource ? { imageSource } : {}), sourceUrl: sourcePageUrl(page.title) });
}
await writeFile(heroDataFile, `${JSON.stringify(heroes, null, 2)}\n`);
console.log(`Saved ${monsters.length} verified monsters and ${heroes.length} hero portraits.`);
