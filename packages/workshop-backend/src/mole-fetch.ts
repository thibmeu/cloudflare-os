import { z } from "zod";
import { AnchorConfig, Credential, Endorsement, ModeratorConfig, PendingGrant,
  PendingPresentation, endorsementRequestType, initSync, startGrant,
} from "./vendor/guac/guac.js";
import wasm from "./vendor/guac/guac_bg.wasm";

const httpsOrigin = z.string().url().refine(value => {
  const url = new URL(value);
  return url.protocol === "https:" && url.origin === value;
}, "MOLE endpoints must be HTTPS origins without paths or credentials");
const settingsSchema = z.object({
  origin: httpsOrigin,
  moderator: httpsOrigin,
  anchor: httpsOrigin,
}).strict();
const encoded = z.string().max(4096).regex(/^[A-Za-z0-9_-]*$/);
const keySchema = z.object({
  "credential-type": z.literal(1), ciphersuite: z.literal("P256-SHA256"),
  "credential-key": encoded, "credential-context": encoded,
  "balance-width": z.number().int().min(1).max(64),
  "result-retention": z.number().int().nonnegative().safe(),
});
const policySchema = z.object({
  "endorsement-type": z.literal(2), ciphersuite: z.literal("P256-SHA256"),
  "anchor-set": z.array(encoded).min(1).max(16), "issuance-epoch": encoded,
});
const directorySchema = z.object({
  "issuance-uri": z.string().url(),
  "credential-keys": z.array(keySchema).min(1).max(16),
  endorsements: z.array(policySchema).min(1).max(16),
});
const anchorSchema = z.object({
  "endorsement-type": z.literal(2), ciphersuite: z.literal("P256-SHA256"),
  "anchor-key": encoded, "issuance-epoch": encoded, "grant-uri": z.string().url(),
});
type Directory = z.infer<typeof directorySchema>;
type Settings = z.infer<typeof settingsSchema>;

/** Private workspace state; never included in chat history or exports. */
export type MoleWallet = {
  settings: Settings;
  directory: Directory;
} & ({kind: "credential"; bytes: Uint8Array}
  | {kind: "presentation"; bytes: Uint8Array}
  | {kind: "enrolling"; bytes?: Uint8Array; request?: Uint8Array; authorization?: string}
  | {kind: "exhausted"});

/** One workspace's wallet persistence, committing before any credential leaves the Worker. */
export type MoleWalletStorage = {
  get(): MoleWallet | undefined;
  put(wallet: MoleWallet): Promise<void>;
};

function decode(value: string): Uint8Array {
  const bytes = Uint8Array.from(atob(value.replaceAll("-", "+").replaceAll("_", "/")), c => c.charCodeAt(0));
  const canonical = btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
  if (canonical !== value) throw new Error("Invalid MOLE configuration encoding");
  return bytes;
}

function nativeConfig(directory: Directory, key = directory["credential-keys"][0]) {
  const policy = directory.endorsements[0];
  return ModeratorConfig.withEndorsements(directory["issuance-uri"], decode(key["credential-key"]),
    key["balance-width"], decode(key["credential-context"]), BigInt(key["result-retention"]),
    Uint8Array.from(policy["anchor-set"].flatMap(anchorKey => [...decode(anchorKey)])), decode(policy["issuance-epoch"]));
}

function endpoint(value: string, origin: string): string {
  const url = new URL(value);
  if (url.origin !== origin || url.username || url.password || url.hash) {
    throw new Error("MOLE configuration points outside its configured origin");
  }
  return url.href;
}

// Configurations and grant messages are bounded independently of the fetched document.
async function readBytes(response: Response): Promise<Uint8Array> {
  const reader = response.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    for (;;) {
      const next = await reader.read();
      if (next.done) break;
      length += next.value.length;
      if (length > 128 * 1024) throw new Error("MOLE response exceeds 128 KiB");
      chunks.push(next.value);
    }
  } finally { await reader.cancel(); reader.releaseLock(); }
  const result = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; }
  return result;
}

async function json(response: Response): Promise<unknown> {
  if (!response.ok) { await response.body?.cancel(); throw new Error(`MOLE configuration failed (${response.status})`); }
  return JSON.parse(new TextDecoder().decode(await readBytes(response)));
}

/** Opt-in transport for one destination, serialized across all chats in its workspace. */
export function createMoleFetch(configuration: string, storage: MoleWalletStorage) {
  const settings = settingsSchema.parse(JSON.parse(configuration));
  let tail: Promise<unknown> = Promise.resolve();

  async function run(url: string, init: RequestInit): Promise<Response> {
    init.signal?.throwIfAborted();
    initSync({module: wasm});
    const call = (target: string, options: RequestInit = {}) => fetch(target, {
      ...options, redirect: "error", signal: init.signal,
    });
    const wallet = storage.get();
    if (wallet && JSON.stringify(wallet.settings) !== JSON.stringify(settings)) {
      throw new Error("MOLE settings changed; operator must migrate or reset the workspace wallet");
    }
    const save = (next: MoleWallet) => storage.put(next);
    if (!wallet) {
      const directory = directorySchema.parse(await json(await call(`${settings.moderator}/config`)));
      endpoint(directory["issuance-uri"], settings.moderator);
      const anchor = anchorSchema.parse(await json(await call(`${settings.anchor}/config`)));
      const grantUrl = endpoint(anchor["grant-uri"], settings.anchor);
      const policy = directory.endorsements.find(candidate => candidate["issuance-epoch"] === anchor["issuance-epoch"]
        && candidate["anchor-set"].includes(anchor["anchor-key"]));
      if (!policy) throw new Error("Configured Anchor is not accepted by the Moderator");
      directory.endorsements = [policy];
      const base = {settings, directory};
      using anchorConfig = new AnchorConfig(decode(anchor["anchor-key"]), decode(anchor["issuance-epoch"]));
      let grant: PendingGrant | undefined = startGrant(anchorConfig);
      let route: string | undefined;
      let endorsement: Endorsement | undefined;
      try {
        // shortcut: interrupted enrollment requires an operator reset; add resumable enrollment with interactive Anchors.
        for (let step = 0; step < 2; step++) {
          if (!grant) throw new Error("Missing MOLE grant continuation");
          await save({...base, kind: "enrolling", bytes: grant.toStorageBytes(), request: grant.request});
          const response = await call(grantUrl, {method: "POST", body: new Uint8Array(grant.request),
            headers: {"Content-Type": endorsementRequestType(), ...(route ? {"X-Guac-Grant": route} : {})}});
          if (!response.ok) { await response.body?.cancel(); throw new Error(`MOLE Anchor rejected enrollment (${response.status})`); }
          const body = await readBytes(response);
          const consumed: PendingGrant = grant;
          grant = undefined; // advance consumes this Rust handle, including on failure.
          const next = consumed.advance(body, response.headers.get("Content-Type") ?? "");
          if (next.isComplete) { endorsement = next.finish(); break; }
          grant = next.continueGrant();
          route = response.headers.get("X-Guac-Grant") ?? undefined;
          if (!route || route.length > 256) throw new Error("Missing MOLE grant route");
        }
        if (!endorsement) throw new Error("MOLE Anchor did not complete enrollment");
        using config = nativeConfig(directory);
        const challenge = await call(directory["issuance-uri"], {method: "POST"});
        const header = challenge.headers.get("WWW-Authenticate");
        await challenge.body?.cancel();
        if (challenge.status !== 401 || !header) throw new Error("Missing MOLE issuance challenge");
        using pending = endorsement.requestCredential(config, header);
        await save({...base, kind: "enrolling", bytes: pending.toStorageBytes(), authorization: pending.authorization});
        const issued = await call(directory["issuance-uri"], {method: "POST", headers: {Authorization: pending.authorization}});
        await issued.body?.cancel();
        if (issued.status !== 200) throw new Error(`MOLE issuance rejected (${issued.status})`);
        using credential = pending.finish(issued.headers.get("Mole-Credential"));
        await save({...base, kind: "credential", bytes: credential.toStorageBytes()});
      } finally { grant?.free(); endorsement?.free(); }
    }
    // Re-read after the committed enrollment writes; no balance is held only in memory.
    const current = storage.get();
    if (!current || current.kind === "enrolling") throw new Error("MOLE enrollment interrupted; operator reset required");
    if (current.kind === "exhausted") throw new Error("MOLE budget exhausted; no automatic refill");
    using config = nativeConfig(current.directory);
    if (current.kind === "presentation") {
      using pending = PendingPresentation.fromStorageBytes(current.bytes, config);
      const recovered = await call(current.directory["issuance-uri"], {method: "POST",
        headers: {Authorization: pending.recoveryAuthorization}});
      await recovered.body?.cancel();
      using credential = pending.finish(recovered.headers.get("Mole-Credential"));
      await save(credential ? {...current, kind: "credential", bytes: credential.toStorageBytes()}
        : {settings, directory: current.directory, kind: "exhausted"});
      throw new Error("MOLE budget recovered; repeat the fetch to request the content again");
    }
    using credential = Credential.fromStorageBytes(current.bytes, config);
    const response = await fetch(url, {...init, redirect: "manual"});
    const header = response.headers.get("WWW-Authenticate");
    await response.body?.cancel();
    if (response.status !== 401 || !header) throw new Error("Configured MOLE destination did not challenge the request");
    using pending = credential.present(header);
    await save({...current, kind: "presentation", bytes: pending.toStorageBytes()});
    const headers = new Headers(init.headers);
    headers.set("Authorization", pending.authorization);
    const result = await fetch(url, {...init, redirect: "manual", headers});
    try {
      using updated = pending.finish(result.headers.get("Mole-Credential"));
      await save(updated ? {...current, bytes: updated.toStorageBytes()}
        : {settings, directory: current.directory, kind: "exhausted"});
      // Do not expose credential updates to the agent, conversion service, or another origin.
      const safe = new Response(result.body, result);
      safe.headers.delete("Mole-Credential");
      return safe;
    } catch (error) { await result.body?.cancel(); throw error; }
  }

  return (url: string, init: RequestInit): Promise<Response> => {
    if (new URL(url).origin !== settings.origin) return fetch(url, init);
    const next = tail.then(() => run(url, init));
    tail = next.catch(() => {});
    return next;
  };
}
