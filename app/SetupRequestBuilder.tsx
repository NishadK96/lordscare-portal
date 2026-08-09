"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Clipboard, Download, Home, RotateCcw, Share2, ShieldCheck } from "lucide-react";

const steps = ["Account", "Building", "Research", "Familiars", "Army", "Review"];
const familiarActions = ["Train", "Train Skills", "Use EXP Items", "Shatter Extra Runes", "Use Skills", "Upgrade Skills", "Enhance"];

type Setup = {
  customerName: string;
  accountName: string;
  accountReference: string;
  buildingEnabled: boolean;
  lowestLevelFirst: boolean;
  buildingPriority: string;
  maxBuildingLevel: string;
  buildingNotes: string;
  researchMode: string;
  researchTree: string;
  researchTarget: string;
  researchTargetLevel: string;
  useTechnolabes: boolean;
  minimumResearchMight: string;
  openPacts: boolean;
  mergePacts: boolean;
  pacts: string;
  distributeHeroes: boolean;
  fragmentLimit: string;
  familiarPriority: string;
  familiarActions: string[];
  trainTroops: boolean;
  rotateTroops: boolean;
  troopTier: string;
  infantry: string;
  ranged: string;
  cavalry: string;
  siege: string;
  healTroops: boolean;
  healSanctuary: boolean;
  useRssFromBag: boolean;
  armyNotes: string;
  finalNotes: string;
};

const initialSetup: Setup = {
  customerName: "", accountName: "", accountReference: "",
  buildingEnabled: true, lowestLevelFirst: true, buildingPriority: "Castle", maxBuildingLevel: "25", buildingNotes: "",
  researchMode: "Target system", researchTree: "", researchTarget: "", researchTargetLevel: "", useTechnolabes: false, minimumResearchMight: "",
  openPacts: true, mergePacts: true, pacts: "", distributeHeroes: true, fragmentLimit: "", familiarPriority: "", familiarActions: ["Train", "Train Skills", "Enhance"],
  trainTroops: true, rotateTroops: false, troopTier: "Highest unlocked", infantry: "", ranged: "", cavalry: "", siege: "", healTroops: true, healSanctuary: true, useRssFromBag: false, armyNotes: "", finalNotes: "",
};

const yesNo = (value: boolean) => value ? "Yes" : "No";

export function SetupRequestBuilder() {
  const [step, setStep] = useState(0);
  const [setup, setSetup] = useState<Setup>(initialSetup);
  const [message, setMessage] = useState("");

  const update = <K extends keyof Setup>(key: K, value: Setup[K]) => setSetup((current) => ({ ...current, [key]: value }));
  const toggleFamiliarAction = (action: string) => update("familiarActions", setup.familiarActions.includes(action) ? setup.familiarActions.filter((item) => item !== action) : [...setup.familiarActions, action]);

  const summary = useMemo(() => [
    "LORDSCARE BOT SETUP REQUEST",
    "",
    `Customer: ${setup.customerName || "Not provided"}`,
    `Bot account: ${setup.accountName || "Not provided"}`,
    `Account reference / IGG ID: ${setup.accountReference || "Not provided"}`,
    "",
    "BUILDING",
    `Auto Build: ${yesNo(setup.buildingEnabled)}`,
    `Lowest Level First: ${yesNo(setup.lowestLevelFirst)}`,
    `Building Priority: ${setup.buildingPriority}`,
    `Maximum Building Level: ${setup.maxBuildingLevel || "Not specified"}`,
    `Building Notes: ${setup.buildingNotes || "None"}`,
    "",
    "RESEARCH",
    `Research Mode: ${setup.researchMode}`,
    `Research Tree: ${setup.researchTree || "Not specified"}`,
    `Target Research: ${setup.researchTarget || "Not specified"}`,
    `Target Level: ${setup.researchTargetLevel || "Not specified"}`,
    `Use Technolabes: ${yesNo(setup.useTechnolabes)}`,
    `Minimum Research Might for Technolabes: ${setup.minimumResearchMight || "Not specified"}`,
    "",
    "FAMILIARS",
    `Open Pacts: ${yesNo(setup.openPacts)}`,
    `Merge Pacts: ${yesNo(setup.mergePacts)}`,
    `Pacts to Merge: ${setup.pacts || "Not specified"}`,
    `Distribute Heroes Evenly: ${yesNo(setup.distributeHeroes)}`,
    `Daily Fragment Limit: ${setup.fragmentLimit || "Not specified"}`,
    `Familiar Priority: ${setup.familiarPriority || "Not specified"}`,
    `Familiar Actions: ${setup.familiarActions.length ? setup.familiarActions.join(", ") : "None"}`,
    "",
    "ARMY TRAINING",
    `Train Troops: ${yesNo(setup.trainTroops)}`,
    `Rotate Troop Types: ${yesNo(setup.rotateTroops)}`,
    `Troop Tier: ${setup.troopTier}`,
    `Total Infantry Target: ${setup.infantry || "Not specified"}`,
    `Total Ranged Target: ${setup.ranged || "Not specified"}`,
    `Total Cavalry Target: ${setup.cavalry || "Not specified"}`,
    `Total Siege Target: ${setup.siege || "Not specified"}`,
    `Heal Troops: ${yesNo(setup.healTroops)}`,
    `Heal Sanctuary: ${yesNo(setup.healSanctuary)}`,
    `Use Resources from Bag: ${yesNo(setup.useRssFromBag)}`,
    `Army Notes: ${setup.armyNotes || "None"}`,
    "",
    `OTHER NOTES: ${setup.finalNotes || "None"}`,
    "",
    "Security: No password, OTP, login token, or access key included.",
  ].join("\n"), [setup]);

  const copySummary = async () => {
    await navigator.clipboard.writeText(summary);
    setMessage("Request copied. You can now paste it into WhatsApp or your support chat.");
  };

  const shareSummary = async () => {
    if (navigator.share) {
      await navigator.share({ title: "LordsCare Bot Setup Request", text: summary });
      setMessage("Request shared.");
    } else {
      await copySummary();
    }
  };

  const downloadSummary = () => {
    const url = URL.createObjectURL(new Blob([summary], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${setup.accountName.trim().replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "bot"}-setup-request.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Request downloaded as a text file.");
  };

  const next = () => {
    if (step === 0 && (!setup.customerName.trim() || !setup.accountName.trim())) {
      setMessage("Please enter your name and bot account name to continue.");
      return;
    }
    setMessage("");
    setStep((current) => Math.min(current + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const restart = () => {
    setSetup(initialSetup);
    setStep(0);
    setMessage("");
  };

  return <main className="setup-page">
    <header className="support-site-header"><div className="support-shell support-nav"><a href="/" className="site-brand"><div className="brand-mark">LC</div><div><strong>LordsCare</strong><span>Bot setup request</span></div></a><nav><a href="/"><Home size={14} />Commands</a></nav></div></header>
    <section className="setup-hero"><div className="setup-shell"><p className="eyebrow light">Guided bot setup</p><h1>Tell us exactly how you want your bot configured.</h1><p>Choose your building, research, familiar, and army preferences. At the end, send the generated request to your LordsCare representative.</p><div className="security-note"><ShieldCheck size={18} /><span><strong>Keep your account safe.</strong> Never enter a game password, OTP, login token, or access key here.</span></div></div></section>
    <div className="setup-shell setup-workspace">
      <ol className="setup-progress" aria-label="Setup progress">{steps.map((label, index) => <li key={label} className={index === step ? "active" : index < step ? "done" : ""}><button type="button" onClick={() => index <= step && setStep(index)}><span>{index < step ? <Check size={14} /> : index + 1}</span>{label}</button></li>)}</ol>
      <section className="setup-card">
        {step === 0 && <><StepHeading number="01" title="Your bot account" text="This identifies which bot configuration the request belongs to." /><div className="setup-form-grid"><Field label="Your name *"><input value={setup.customerName} onChange={(event) => update("customerName", event.target.value)} placeholder="Customer name" /></Field><Field label="Bot account name *"><input value={setup.accountName} onChange={(event) => update("accountName", event.target.value)} placeholder="Example: NishadV6" /></Field><Field label="Account reference / IGG ID (optional)" wide><input value={setup.accountReference} onChange={(event) => update("accountReference", event.target.value)} placeholder="Use an ID only — never enter a password" /></Field></div></>}
        {step === 1 && <><StepHeading number="02" title="Building settings" text="Choose how the bot should construct and upgrade buildings." /><div className="setup-form-grid"><Switch label="Auto Build" help="Allow automatic building and upgrades" checked={setup.buildingEnabled} onChange={(value) => update("buildingEnabled", value)} /><Switch label="Lowest Level First" help="Prioritize the lowest-level eligible building" checked={setup.lowestLevelFirst} onChange={(value) => update("lowestLevelFirst", value)} /><Field label="Building priority"><select value={setup.buildingPriority} onChange={(event) => update("buildingPriority", event.target.value)}>{["Castle", "Resource buildings", "Academy", "Manor", "Barracks / Infirmary", "Monsterhold", "Familiars", "Trading Post", "Resource (No Manor)", "Treasure Trove", "Workshop", "No Priority"].map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Maximum building level"><input type="number" min="1" max="25" value={setup.maxBuildingLevel} onChange={(event) => update("maxBuildingLevel", event.target.value)} /></Field><Field label="Special building instructions" wide><textarea value={setup.buildingNotes} onChange={(event) => update("buildingNotes", event.target.value)} placeholder="Example: Focus on Infirmaries after Castle 25" /></Field></div></>}
        {step === 2 && <><StepHeading number="03" title="Research settings" text="Choose a specific target or let the bot follow your preferred research tree." /><div className="setup-form-grid"><Field label="Research mode"><select value={setup.researchMode} onChange={(event) => update("researchMode", event.target.value)}><option>Target system</option><option>Research tree order</option><option>Pause auto research</option></select></Field><Field label="Research tree"><input value={setup.researchTree} onChange={(event) => update("researchTree", event.target.value)} placeholder="Example: Military" /></Field><Field label="Target research"><input value={setup.researchTarget} onChange={(event) => update("researchTarget", event.target.value)} placeholder="Example: Army Leadership" /></Field><Field label="Target level"><input type="number" min="1" value={setup.researchTargetLevel} onChange={(event) => update("researchTargetLevel", event.target.value)} placeholder="10" /></Field><Switch label="Use Technolabes" help="Use available Technolabes for research" checked={setup.useTechnolabes} onChange={(value) => update("useTechnolabes", value)} /><Field label="Minimum research might for Technolabes"><input value={setup.minimumResearchMight} onChange={(event) => update("minimumResearchMight", event.target.value)} placeholder="Example: 5M" /></Field></div></>}
        {step === 3 && <><StepHeading number="04" title="Familiar settings" text="Set pact handling, hero distribution, and familiar actions." /><div className="setup-form-grid"><Switch label="Open Pacts" help="Open available familiar pacts" checked={setup.openPacts} onChange={(value) => update("openPacts", value)} /><Switch label="Merge Pacts" help="Automatically merge selected pacts" checked={setup.mergePacts} onChange={(value) => update("mergePacts", value)} /><Field label="Pacts to merge" wide><input value={setup.pacts} onChange={(event) => update("pacts", event.target.value)} placeholder="Example: Pact 3 and Pact 4 (only unlocked pacts)" /></Field><Switch label="Distribute Heroes Evenly" help="Spread heroes across available training slots" checked={setup.distributeHeroes} onChange={(value) => update("distributeHeroes", value)} /><Field label="Daily fragment limit"><input type="number" min="0" value={setup.fragmentLimit} onChange={(event) => update("fragmentLimit", event.target.value)} placeholder="Optional" /></Field><Field label="Familiar priority" wide><input value={setup.familiarPriority} onChange={(event) => update("familiarPriority", event.target.value)} placeholder="Example: Hoarder first, then Trickstar" /></Field><fieldset className="setup-checkbox-group"><legend>Actions to use</legend>{familiarActions.map((action) => <label key={action}><input type="checkbox" checked={setup.familiarActions.includes(action)} onChange={() => toggleFamiliarAction(action)} /><span>{action}</span></label>)}</fieldset></div></>}
        {step === 4 && <><StepHeading number="05" title="Army training" text="Enter the total troop counts you want. Include troops already trained in these targets." /><div className="setup-form-grid"><Switch label="Train Troops" help="Allow automatic troop training" checked={setup.trainTroops} onChange={(value) => update("trainTroops", value)} /><Switch label="Rotate Troop Types" help="Rotate between selected troop types" checked={setup.rotateTroops} onChange={(value) => update("rotateTroops", value)} /><Field label="Troop tier"><select value={setup.troopTier} onChange={(event) => update("troopTier", event.target.value)}>{["Highest unlocked", "T1", "T2", "T3", "T4", "T5"].map((item) => <option key={item}>{item}</option>)}</select></Field><div className="setup-field-spacer" /><Field label="Total Infantry"><input value={setup.infantry} onChange={(event) => update("infantry", event.target.value)} placeholder="Example: 1M" /></Field><Field label="Total Ranged"><input value={setup.ranged} onChange={(event) => update("ranged", event.target.value)} placeholder="Example: 1M" /></Field><Field label="Total Cavalry"><input value={setup.cavalry} onChange={(event) => update("cavalry", event.target.value)} placeholder="Example: 1M" /></Field><Field label="Total Siege"><input value={setup.siege} onChange={(event) => update("siege", event.target.value)} placeholder="Example: 100K" /></Field><Switch label="Heal Troops" help="Automatically heal wounded troops" checked={setup.healTroops} onChange={(value) => update("healTroops", value)} /><Switch label="Heal Sanctuary" help="Automatically heal the Sanctuary" checked={setup.healSanctuary} onChange={(value) => update("healSanctuary", value)} /><Switch label="Use Resources from Bag" help="Use bag resources when necessary" checked={setup.useRssFromBag} onChange={(value) => update("useRssFromBag", value)} /><Field label="Other army instructions" wide><textarea value={setup.armyNotes} onChange={(event) => update("armyNotes", event.target.value)} placeholder="Example: Prioritize Ranged until 2M, then rotate Infantry and Cavalry" /></Field></div></>}
        {step === 5 && <><StepHeading number="06" title="Review and send" text="Check the request, add any final notes, then copy or share it with us." /><Field label="Other instructions"><textarea value={setup.finalNotes} onChange={(event) => update("finalNotes", event.target.value)} placeholder="Anything else we should know?" /></Field><pre className="setup-summary">{summary}</pre><div className="setup-share-actions"><button type="button" className="primary-button" onClick={copySummary}><Clipboard size={17} />Copy request</button><button type="button" className="secondary-button" onClick={shareSummary}><Share2 size={17} />Share</button><button type="button" className="secondary-button" onClick={downloadSummary}><Download size={17} />Download .txt</button></div></>}
        {message && <p className="setup-message" role="status">{message}</p>}
        <footer className="setup-card-footer"><button type="button" className="secondary-button" onClick={() => step === 0 ? restart() : setStep(step - 1)}>{step === 0 ? <RotateCcw size={16} /> : <ArrowLeft size={16} />}{step === 0 ? "Clear form" : "Previous"}</button>{step < steps.length - 1 && <button type="button" className="primary-button" onClick={next}>{step === steps.length - 2 ? "Review request" : "Continue"}<ArrowRight size={16} /></button>}</footer>
      </section>
    </div>
  </main>;
}

function StepHeading({ number, title, text }: { number: string; title: string; text: string }) {
  return <div className="setup-step-heading"><span>{number}</span><div><h2>{title}</h2><p>{text}</p></div></div>;
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return <label className={`setup-field${wide ? " wide" : ""}`}><span>{label}</span>{children}</label>;
}

function Switch({ label, help, checked, onChange }: { label: string; help: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="setup-switch"><span><strong>{label}</strong><small>{help}</small></span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><i aria-hidden="true" /></label>;
}
