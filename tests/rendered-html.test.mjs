import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("native Next.js build creates the Vercel output", async () => {
  await access(new URL("../.next/BUILD_ID", import.meta.url));
  const packageSource = await readFile(new URL("../package.json", import.meta.url), "utf8");
  const vercelSource = await readFile(new URL("../vercel.json", import.meta.url), "utf8");
  assert.match(packageSource, /"build": "next build"/);
  assert.match(vercelSource, /"framework": "nextjs"/);
});

test("legacy customer links also open support without authentication", async () => {
  const publicSource = await readFile(new URL("../app/PublicSupport.tsx", import.meta.url), "utf8");
  const layoutSource = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  const customerSource = await readFile(new URL("../app/customer/page.tsx", import.meta.url), "utf8");
  const passwordSource = await readFile(new URL("../app/set-password/page.tsx", import.meta.url), "utf8");
  assert.match(layoutSource, /LordsCare Bot Support/);
  assert.match(publicSource, /Find the right bot command/);
  assert.match(publicSource, /without creating an account or signing in/);
  assert.match(customerSource, /PublicSupport/);
  assert.match(passwordSource, /PublicSupport/);
  assert.doesNotMatch(customerSource + passwordSource, /LoginPanel|Choose your password|Checking your secure link/i);
});

test("customer settings retain applied state and serialize disabled switches", async () => {
  const source = await readFile(new URL("../app/PortalShell.tsx", import.meta.url), "utf8");
  assert.match(source, /request\.status === "applied"/);
  assert.match(source, /Current applied values loaded/);
  assert.match(source, /element\.type === "checkbox"/);
  assert.match(source, /settings\[element\.name\] = "off"/);
  assert.match(source, /appliedChecked\("always_shielded"/);
  assert.match(source, /appliedValue\("shield_redeploy_minutes"/);
});

test("customer bank commands use the administrator-configured prefix", async () => {
  const portalSource = await readFile(new URL("../app/PortalShell.tsx", import.meta.url), "utf8");
  const source = await readFile(new URL("../app/CommandLibrary.tsx", import.meta.url), "utf8");
  const homeSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const commandSource = await readFile(new URL("../app/data.ts", import.meta.url), "utf8");
  const migration = await readFile(new URL("../supabase/migrations/002_customer_command_prefix.sql", import.meta.url), "utf8");
  assert.match(portalSource, /commandPrefix: profile\?\.command_prefix \|\| "!"/);
  assert.match(portalSource, /<CommandLibrary prefix=\{snapshot\?\.commandPrefix \|\| "!"\}/);
  assert.match(source, /Commands for prefix <code>\{prefix\}<\/code>/);
  assert.match(source, /command\.replaceAll\("!", prefix\)/);
  assert.match(portalSource, /customer_command_prefix_updated/);
  assert.match(homeSource, /PublicSupport/);
  assert.doesNotMatch(homeSource, /LoginPanel/);
  assert.equal((commandSource.match(/^  \{ command:/gm) ?? []).length, 67);
  assert.match(commandSource, /!relocatekvk \[K\]/);
  assert.match(commandSource, /!findnestlocal \[level\]/);
  assert.match(commandSource, /!adminrss \[F\] \[S\] \[W\] \[O\] \[G\] \[player\]/);
  assert.doesNotMatch(commandSource, /relocator/);
  assert.match(migration, /default '!'/);
  assert.match(migration, /between 1 and 3/);
});

test("public guided setup request covers the core bot configuration", async () => {
  const publicSource = await readFile(new URL("../app/PublicSupport.tsx", import.meta.url), "utf8");
  const routeSource = await readFile(new URL("../app/setup-request/page.tsx", import.meta.url), "utf8");
  const builderSource = await readFile(new URL("../app/SetupRequestBuilder.tsx", import.meta.url), "utf8");
  assert.match(publicSource, /\/setup-request/);
  assert.match(routeSource, /SetupRequestBuilder/);
  assert.match(builderSource, /Building settings/);
  assert.match(builderSource, /Research settings/);
  assert.match(builderSource, /Familiar settings/);
  assert.match(builderSource, /Army training/);
  assert.match(builderSource, /navigator\.clipboard\.writeText/);
  assert.match(builderSource, /navigator\.share/);
  assert.match(builderSource, /Never enter a game password, OTP, login token, or access key/);
});
