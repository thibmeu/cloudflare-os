import { env } from "cloudflare:workers";
import { abortAllDurableObjects, runInDurableObject } from "cloudflare:test";
import type { OverseerDurableObject } from "../src/overseer";
import { afterEach, expect, it, vi } from "vitest";
import { createMoleFetch, type MoleWallet, type MoleWalletStorage } from "../src/mole-fetch";
import { Credential, ModeratorConfig } from "../src/vendor/guac/guac.js";
import { webFetch } from "../src/web-fetch";
import { base64url, createAnchorCrypto, createCrypto } from "./mole/runtime";

const settings = {origin: "https://site.example", moderator: "https://moderator.example", anchor: "https://anchor.example"};
const configuration = JSON.stringify(settings);
const target = `${settings.origin}/page`;
afterEach(() => vi.restoreAllMocks());

async function setup() {
  const epoch = [...new TextEncoder().encode("poc")];
  const anchor = await createAnchorCrypto("01".repeat(32), epoch);
  const moderator = await createCrypto("02".repeat(32), `${settings.moderator}/issue`, "credits-poc",
    {keys: [anchor.configuration.public_key], epoch}, null);
  const key = moderator.configuration;
  let wallet: MoleWallet | undefined;
  const storage: MoleWalletStorage = {
    get: () => structuredClone(wallet),
    put: async next => { wallet = structuredClone(next); },
  };
  let grantState: number[] | undefined;
  let accepted = 0;
  let loseResponse = false;
  let invalidUpdate = false;
  let redirect: string | undefined;
  const records = new Map<string, number[]>();
  const calls: {url: string; authorization: string | null}[] = [];
  const mock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    const url = String(input);
    const headers = new Headers(init?.headers);
    const authorization = headers.get("Authorization");
    calls.push({url, authorization});
    const now = Math.floor(Date.now() / 1000);
    if (url === `${settings.anchor}/config`) return Response.json({
      "grant-uri": `${settings.anchor}/grant`, "endorsement-type": 2, ciphersuite: "P256-SHA256",
      "anchor-key": base64url(anchor.configuration.public_key), "issuance-epoch": base64url(epoch),
    });
    if (url === `${settings.moderator}/config`) return Response.json({
      "issuance-uri": `${settings.moderator}/issue`,
      endorsements: [{"endorsement-type": 2, ciphersuite: "P256-SHA256",
        "anchor-set": [base64url(anchor.configuration.public_key)], "issuance-epoch": base64url(epoch)}],
      "credential-keys": [{"credential-type": 1, ciphersuite: "P256-SHA256", "credential-key": base64url(key.public_key),
        "credential-context": base64url(key.context), "balance-width": key.balance_bits, "result-retention": Number(key.retention)}],
    });
    if (url === `${settings.anchor}/grant`) {
      expect(storage.get()?.kind).toBe("enrolling");
      if (!grantState) {
        const reply = anchor.run({kind: "anchor_commit", now});
        if (reply.kind !== "anchor_committed") throw new Error("Anchor commitment failed");
        grantState = reply.state;
        return new Response(Uint8Array.from(reply.response), {headers: {
          "Content-Type": "application/mole-endorsement-response; type=0002", "X-Guac-Grant": "route",
        }});
      }
      expect(headers.get("X-Guac-Grant")).toBe("route");
      const reply = anchor.run({kind: "anchor_respond", now, state: grantState,
        request: [...new Uint8Array(await new Response(init?.body).arrayBuffer())]});
      grantState = undefined;
      if (reply.kind !== "message") throw new Error("Anchor response failed");
      return new Response(Uint8Array.from(reply.bytes), {headers: {"Content-Type": "application/mole-endorsement-response; type=0002"}});
    }
    if (url === `${settings.moderator}/issue`) {
      if (!authorization) {
        const reply = moderator.run({kind: "issuance_challenge", now});
        if (reply.kind !== "header") throw new Error("Issuance challenge failed");
        return new Response(null, {status: 401, headers: {"WWW-Authenticate": reply.value}});
      }
      const operation = moderator.run({kind: "operation", authorization});
      if (operation.kind === "operation" && operation.operation === "recovery") {
        const id = moderator.run({kind: "nullifier", authorization});
        if (id.kind !== "nullifier") throw new Error("Missing recovery nullifier");
        const record = records.get(String(id.nullifier));
        if (!record) return new Response(null, {status: 404});
        const reply = moderator.run({kind: "recover", now, authorization, record});
        if (reply.kind !== "header") throw new Error("Recovery failed");
        return new Response(null, {headers: {"Mole-Credential": reply.value}});
      }
      expect(storage.get()?.kind).toBe("enrolling");
      const reply = moderator.run({kind: "issue", now, authorization});
      if (reply.kind !== "issued") throw new Error("Issuance failed");
      return new Response(null, {headers: {"Mole-Credential": reply.credential}});
    }
    if (new URL(url).origin !== settings.origin) return new Response("other origin");
    if (!authorization) {
      const reply = moderator.run({kind: "presentation_challenge", now, binding: `GET ${url}`});
      if (reply.kind !== "header") throw new Error("Presentation challenge failed");
      return new Response(null, {status: 401, headers: {"WWW-Authenticate": reply.value}});
    }
    expect(storage.get()?.kind).toBe("presentation");
    const reply = moderator.run({kind: "verify", now, authorization, binding: `GET ${url}`});
    if (reply.kind !== "verified") throw new Error("Presentation failed");
    expect(records.has(String(reply.nullifier))).toBe(false);
    records.set(String(reply.nullifier), reply.record);
    accepted++;
    if (loseResponse) { loseResponse = false; throw new Error("response lost"); }
    return new Response(redirect ? null : "protected page", {status: redirect ? 302 : 200, headers: {
      "Content-Type": "text/plain", "Mole-Credential": invalidUpdate ? "invalid" : reply.credential,
      ...(redirect ? {Location: redirect} : {}),
    }});
  });
  return {storage, mock, calls, wallet: () => wallet, accepted: () => accepted,
    lose: () => { loseResponse = true; }, corrupt: () => { invalidUpdate = true; },
    redirect: (url: string) => { redirect = url; },
    balance: () => {
      if (wallet?.kind !== "credential") throw new Error("No credential");
      using config = ModeratorConfig.withEndorsements(key.endpoint, Uint8Array.from(key.public_key), key.balance_bits,
        Uint8Array.from(key.context), BigInt(key.retention), Uint8Array.from(anchor.configuration.public_key), Uint8Array.from(epoch));
      using credential = Credential.fromStorageBytes(wallet.bytes, config);
      return credential.balance;
    }};
}

it("uses real Guac in workerd: enrolls once, persists spends, serializes concurrent fetches", async () => {
  const fixture = await setup();
  const transport = createMoleFetch(configuration, fixture.storage);
  const results = await Promise.all([transport(target, {}), transport(target, {})]);
  expect(await results[0].text()).toBe("protected page");
  expect(results.every(response => !response.headers.has("Mole-Credential"))).toBe(true);
  expect(fixture.accepted()).toBe(2);
  expect(fixture.balance()).toBe(6n);
  expect(fixture.calls.filter(call => call.url.endsWith("/grant"))).toHaveLength(2);
});

it("recovers after a lost response and host recreation without repeating the operation", async () => {
  const fixture = await setup();
  fixture.lose();
  await expect(createMoleFetch(configuration, fixture.storage)(target, {})).rejects.toThrow("response lost");
  expect(fixture.wallet()?.kind).toBe("presentation");
  const restarted = createMoleFetch(configuration, fixture.storage);
  await expect(restarted(target, {})).rejects.toThrow("budget recovered");
  expect(fixture.accepted()).toBe(1);
  expect(fixture.balance()).toBe(7n);
  await restarted(target, {});
  expect(fixture.accepted()).toBe(2);
});

it("does not send after a pending-state commit fails", async () => {
  const fixture = await setup();
  const transport = createMoleFetch(configuration, fixture.storage);
  await transport(target, {});
  const before = fixture.accepted();
  vi.spyOn(fixture.storage, "put").mockRejectedValueOnce(new Error("commit failed"));
  await expect(transport(target, {})).rejects.toThrow("commit failed");
  expect(fixture.accepted()).toBe(before);
});

it("retains pending state when a credential update is invalid", async () => {
  const fixture = await setup();
  fixture.corrupt();
  await expect(createMoleFetch(configuration, fixture.storage)(target, {})).rejects.toThrow();
  expect(fixture.wallet()?.kind).toBe("presentation");
});

it("does not refill an insufficient budget", async () => {
  const fixture = await setup();
  const transport = createMoleFetch(configuration, fixture.storage);
  for (let i = 0; i < 7; i++) await transport(target, {});
  expect(fixture.balance()).toBe(1n);
  await expect(transport(target, {})).rejects.toThrow();
  expect(fixture.calls.filter(call => call.url.endsWith("/grant"))).toHaveLength(2);
  expect(fixture.accepted()).toBe(7);
});

it("keeps redirect validation and never forwards MOLE authorization to another origin", async () => {
  const fixture = await setup();
  fixture.redirect("https://other.example/page");
  const transport = createMoleFetch(configuration, fixture.storage);
  // raw skips the AI binding: this test owns transport and permission checks only.
  const result = await webFetch({ai: {} as Ai, gateway: null, fetch: transport}, {url: target, raw: true});
  expect(result.body).toBe("other origin");
  expect(fixture.calls.at(-1)).toEqual({url: "https://other.example/page", authorization: null});
  const count = fixture.calls.length;
  await expect(webFetch({ai: {} as Ai, gateway: null, fetch: transport, allowedHosts: new Set(["site.example"])},
    {url: target, raw: true})).rejects.toThrow("not allowed");
  expect(fixture.calls.slice(count).some(call => call.url.startsWith("https://other.example"))).toBe(false);
});

it("rejects unsafe configuration before making requests", () => {
  const fetch = vi.spyOn(globalThis, "fetch");
  expect(() => createMoleFetch(JSON.stringify({...settings, anchor: "http://localhost"}), {
    get: () => undefined, put: async () => {},
  })).toThrow();
  expect(fetch).not.toHaveBeenCalled();
});


declare module "cloudflare:workers" {
  interface ProvidedEnv {
    TEST_OVERSEER: DurableObjectNamespace<OverseerDurableObject>;
  }
}

it("wires authorized webFetch to the workspace wallet and recovers after a real DO restart", async () => {
  const fixture = await setup();
  const name = crypto.randomUUID();
  async function attempt() {
    return runInDurableObject(env.TEST_OVERSEER.getByName(name), async instance => {
      instance.impl.env.MOLE_WEB_FETCH = configuration;
      fixture.storage.get = () => instance.impl.storage.moleWallet.get();
      const authorization = await instance.impl.authorizeWebFetch(0, target, false);
      if (!("env" in authorization)) throw new Error("Unexpected approval request");
      return webFetch(authorization.env, {url: target, raw: true});
    });
  }
  fixture.lose();
  await expect(attempt()).rejects.toThrow("response lost");
  await abortAllDurableObjects();
  await expect(attempt()).rejects.toThrow("budget recovered");
  expect(fixture.accepted()).toBe(1);
  expect((await attempt()).body).toBe("protected page");
  expect(fixture.accepted()).toBe(2);
});

it("leaves other origins on the ordinary fetch path without creating a wallet", async () => {
  const fixture = await setup();
  await createMoleFetch(configuration, fixture.storage)("https://other.example/page", {});
  expect(fixture.wallet()).toBeUndefined();
  expect(fixture.calls).toEqual([{url: "https://other.example/page", authorization: null}]);
});

it("does not start a grant when its storage commit fails", async () => {
  const fixture = await setup();
  vi.spyOn(fixture.storage, "put").mockRejectedValueOnce(new Error("commit failed"));
  await expect(createMoleFetch(configuration, fixture.storage)(target, {})).rejects.toThrow("commit failed");
  expect(fixture.calls.some(call => call.url.endsWith("/grant"))).toBe(false);
});

it("refuses to silently bypass moderation on a configured origin", async () => {
  const fixture = await setup();
  const transport = createMoleFetch(configuration, fixture.storage);
  await transport(target, {});
  fixture.mock.mockResolvedValueOnce(new Response("unmoderated page"));
  await expect(transport(target, {})).rejects.toThrow("did not challenge");
  expect(fixture.balance()).toBe(7n);
});
