import type { Metadata } from "next";
import { ArrowDown, CheckCircle2, MessageCircle, ShieldCheck } from "lucide-react";
import { generalWhatsAppUrl } from "../contact";
import { PlanConversion } from "../PlanConversion";
import { SupportHeader } from "../SupportHeader";

export const metadata: Metadata = {
  title: "Subscription Plans",
  description: "Compare LordsCare subscription prices for one to five managed accounts and send a prepared enquiry directly through WhatsApp.",
};

export default function PlansPage() {
  return <main className="plans-page">
    <SupportHeader active="plans" subtitle="Subscription Plans" />
    <section className="plans-hero"><div className="support-shell plans-hero-grid"><div><p className="eyebrow light">LordsCare subscriptions</p><h1>Choose your plan.<br /><em>Start with one message.</em></h1><p>Plans for one to five managed accounts, with monthly, three-month, and yearly options. Select what you need and send a ready-made WhatsApp enquiry.</p><div className="plans-hero-actions"><a className="plans-primary-action" href="#plans-heading">View plans<ArrowDown /></a><a className="plans-whatsapp-action" href={generalWhatsAppUrl} target="_blank" rel="noreferrer"><MessageCircle />Ask on WhatsApp</a></div></div><aside className="plans-hero-card"><span className="plans-hero-badge"><ShieldCheck />Direct onboarding</span><p>Plans start from</p><div><small>₹</small><strong>150</strong><span>/ month</span></div><ul><li><CheckCircle2 />No login required to enquire</li><li><CheckCircle2 />Prepared WhatsApp message</li><li><CheckCircle2 />Prices shown clearly before contact</li></ul></aside></div></section>
    <PlanConversion />
    <footer className="support-footer plans-footer"><div className="support-shell"><div className="site-brand"><div className="brand-mark">LC</div><div><strong>LordsCare</strong><span>Subscription Plans</span></div></div><p>Questions before choosing? <a href={generalWhatsAppUrl} target="_blank" rel="noreferrer">Chat with LordsCare on WhatsApp</a>.</p></div></footer>
  </main>;
}
