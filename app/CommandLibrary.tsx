"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Search, ShieldCheck } from "lucide-react";
import { commands, type BankCommand } from "./data";

export function CommandLibrary({ prefix }: { prefix: string }) {
  const [query, setQuery] = useState("");
  const [access, setAccess] = useState<"member" | "admin">("member");
  const [category, setCategory] = useState<"All" | BankCommand["group"]>("All");
  const displayCommand = (command: string) => command.replaceAll("!", prefix);
  const categoryOptions: ("All" | BankCommand["group"])[] = ["All", "General", "Search", "Balance", "Resources"];
  const accessCommands = commands.filter((item) => item.admin === (access === "admin"));
  const filtered = useMemo(() => commands.filter((item) => {
    if (item.admin !== (access === "admin") || (category !== "All" && item.group !== category)) return false;
    const searchable = `${displayCommand(item.command)} ${displayCommand(item.example || "")} ${item.description} ${item.group}`.toLowerCase();
    return searchable.includes(query.toLowerCase());
  }), [query, access, category, prefix]);
  const [copied, setCopied] = useState("");

  function copy(value: string) {
    navigator.clipboard?.writeText(value);
    setCopied(value);
    setTimeout(() => setCopied(""), 1200);
  }

  return <section className="panel full-panel command-library" id="commands"><div className="commands-hero"><div><p className="eyebrow">Guild Bank command library</p><h2>Commands for prefix <code>{prefix}</code></h2><p>Official Guild Bank commands, organized by purpose. Copy a ready-to-use example and replace its sample values.</p></div><div className="command-count"><strong>{commands.length}</strong><span>documented commands</span></div></div><div className="command-notes"><ShieldCheck size={18} /><div><strong>Before using a command</strong><span>For player names with spaces, use an underscore such as <code>Player_1</code> or quotation marks such as <code>"Player 1"</code>. Actual access depends on the minimum ranks configured for your bank.</span></div></div><div className="command-toolbar"><div className="command-access-tabs" role="tablist" aria-label="Command access"><button role="tab" aria-selected={access === "member"} className={access === "member" ? "active" : ""} onClick={() => { setAccess("member"); setCategory("All"); }}>Member & info<span>{commands.filter((item) => !item.admin).length}</span></button><button role="tab" aria-selected={access === "admin"} className={access === "admin" ? "active" : ""} onClick={() => { setAccess("admin"); setCategory("All"); }}>Bank control<span>{commands.filter((item) => item.admin).length}</span></button></div><div className="search-box command-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search command, example or purpose…" aria-label="Search commands" /></div></div><div className="command-category-tabs" aria-label="Command categories">{categoryOptions.map((option) => { const count = accessCommands.filter((item) => option === "All" || item.group === option).length; return <button key={option} className={category === option ? "active" : ""} onClick={() => setCategory(option)}>{option}<span>{count}</span></button>; })}</div>{category === "Search" && <div className="search-tip"><Search size={16} /><span>Searches cover roughly 70 tiles. Add <code>chat</code> to the end of a search command to post its result in Guild Chat.</span></div>}<div className="command-list">{filtered.map((item) => { const syntax = displayCommand(item.command); const example = displayCommand(item.example || item.command); return <article key={`${item.admin}-${item.group}-${item.command}`}><div className="command-card-top"><span>{item.group}</span><button onClick={() => copy(example)} aria-label={`Copy ${example}`}>{copied === example ? <Check size={17} /> : <Copy size={17} />}{copied === example ? "Copied" : "Copy example"}</button></div><code className="command-syntax">{syntax}</code><p>{item.description}</p><div className="command-example"><small>Example</small><code>{example}</code></div></article>; })}</div>{!filtered.length && <div className="empty-state compact-empty"><Search /><h3>No matching commands</h3><p>Try another keyword or category.</p></div>}<p className="command-source-note">Command names and examples follow the <a href="https://help.lords-bot.com/faq/guild-bank-commands/" target="_blank" rel="noreferrer">official Lords Bot Guild Bank reference</a>, last updated March 18, 2025.</p></section>;
}
