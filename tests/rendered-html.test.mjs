import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the LordsCare login portal", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>LordsCare Customer Portal<\/title>/i);
  assert.match(html, /Your service/);
  assert.match(html, /Sign in to view your accounts, plan and configuration requests/);
  assert.doesNotMatch(html, /codex-preview|Building your site|react-loading-skeleton/i);
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
