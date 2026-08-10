import { ExternalLink, MessageCircle } from "lucide-react";
import Link from "next/link";
import { generalWhatsAppUrl } from "./contact";

type SupportSection = "commands" | "features" | "events" | "monsters" | "plans";

export function SupportHeader({ active, subtitle }: { active: SupportSection; subtitle: string }) {
  const links: { id: SupportSection; label: string; href: string }[] = [
    { id: "commands", label: "Commands", href: "/#commands" },
    { id: "features", label: "Features", href: "/features" },
    { id: "events", label: "Events", href: "/events" },
    { id: "monsters", label: "Monsters", href: "/monsters" },
    { id: "plans", label: "Plans", href: "/plans" },
  ];

  return <header className="support-site-header"><div className="support-shell support-nav"><Link href="/" className="site-brand" aria-label="LordsCare support home"><div className="brand-mark">LC</div><div><strong>LordsCare</strong><span>{subtitle}</span></div></Link><nav aria-label="Support sections">{links.map((link) => <Link className="mobile-primary-link" href={link.href} aria-current={active === link.id ? "page" : undefined} key={link.id}>{link.label}</Link>)}<a className="nav-external-link" href="https://help.lords-bot.com/faq/guild-bank-commands/" target="_blank" rel="noreferrer">Official guide<ExternalLink size={14} /></a><a className="nav-whatsapp-link" href={generalWhatsAppUrl} target="_blank" rel="noreferrer"><MessageCircle />WhatsApp</a></nav></div></header>;
}
