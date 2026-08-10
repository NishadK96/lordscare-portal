import { Bot, Boxes, Building2, Castle, Gift, Landmark, PawPrint, ShieldCheck } from "lucide-react";
import { featureGroups } from "./featureData";

const icons = [Gift, ShieldCheck, Building2, Castle, Boxes, Bot, PawPrint, Landmark];

export function FeatureGrid({ limit, compact = false }: { limit?: number; compact?: boolean }) {
  return <div className={`customer-feature-grid ${compact ? "compact" : ""}`}>{featureGroups.slice(0, limit).map((feature, index) => {
    const Icon = icons[index];
    return <article className="customer-feature-card" key={feature.id}><div className="customer-feature-icon"><Icon /></div><div><h3>{feature.title}</h3><p>{feature.summary}</p></div><ul>{feature.items.map((item) => <li key={item}>{item}</li>)}</ul></article>;
  })}</div>;
}
