import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the public LordsCare subscriber support site", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>LordsCare Bot Support<\/title>/i);
  assert.match(html, /Find the right bot command/);
  assert.match(html, /Browse the complete Guild Bank command library without creating an account or signing in/);
  assert.match(html, /67 documented commands/);
  assert.doesNotMatch(html, /Sign in|Email address|Password|Your subscription|Connected accounts/i);
  assert.doesNotMatch(html, /codex-preview|Building your site|react-loading-skeleton/i);
});

test("legacy customer links also open support without authentication", async () => {
  for (const path of ["/customer", "/set-password"]) {
    const response = await render(path);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /Find the right bot command/);
    assert.doesNotMatch(html, /Checking your secure link|Choose your password|Sign in to your portal/i);
  }
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
