import createModule from './build/crypto.js';
import wasm from './build/crypto.wasm';

export type Configuration = {
  key_id: number[]; endpoint: string; public_key: number[]; balance_bits: number;
  context: number[]; retention: string;
};
/** Ordered Anchor public keys sharing an issuance epoch. */
export type AnchorSet = { keys: number[][]; epoch: number[] };
export type Role = 'moderator' | 'anchor';
type Reply = ({ kind: 'configuration' } & Configuration)
  | { kind: 'secret'; secret: string }
  | { kind: 'key_id'; key_id: number[] | null }
  | { kind: 'message'; bytes: number[] }
  | { kind: 'header'; value: string }
  | { kind: 'operation'; operation: Operation }
  | { kind: 'issued'; credential: string; replay_id: number[] | null; epoch: number[] | null; retain_until: number | null }
  | { kind: 'verified'; nullifier: number[]; record: number[]; credential: string }
  | { kind: 'nullifier'; nullifier: number[] }
  | { kind: 'anchor_configuration'; public_key: number[]; epoch: number[] }
  | { kind: 'anchor_committed'; state: number[]; response: number[]; expires_at: number }
  | { kind: 'failed'; status: 400 | 401 | 409 | 500 };
type Command = { kind: 'generate'; role: Role }
  | { kind: 'key_id'; authorization: string }
  | { kind: 'init'; secret: string; endpoint: string; context: string; anchors: AnchorSet | null; previous: AnchorSet | null }
  | { kind: 'anchor_init'; secret: string; epoch: number[] }
  | { kind: 'anchor_commit'; now: number }
  | { kind: 'anchor_respond'; now: number; state: number[]; request: number[] }
  | { kind: 'issuance_challenge'; now: number }
  | { kind: 'presentation_challenge'; now: number; binding: string }
  | { kind: 'operation'; authorization: string }
  | { kind: 'issue'; now: number; authorization: string }
  | { kind: 'verify'; now: number; authorization: string; binding: string }
  | { kind: 'nullifier'; authorization: string }
  | { kind: 'recover'; now: number; authorization: string; record: number[] };
/** What a `Mole` `Authorization` value asks for; `none` for other schemes. */
export type Operation = 'none' | 'issue' | 'presentation' | 'recovery';

export function base64url(bytes: number[]): string {
  return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function bytes(value: unknown, length?: number): value is number[] {
  return Array.isArray(value) && (length === undefined || value.length === length)
    && value.every((byte: unknown) => typeof byte === 'number' && Number.isInteger(byte) && byte >= 0 && byte <= 255);
}
function reply(value: unknown): Reply {
  if (record(value)) {
    switch (value.kind) {
      case 'failed':
        if (value.status === 400 || value.status === 401 || value.status === 409 || value.status === 500) return { kind: 'failed', status: value.status };
        break;
      case 'configuration':
        if (bytes(value.key_id, 32) && typeof value.endpoint === 'string' && bytes(value.public_key, 33)
          && typeof value.balance_bits === 'number' && bytes(value.context)
          && typeof value.retention === 'string' && /^[1-9][0-9]*$/.test(value.retention))
          return { kind: 'configuration', key_id: value.key_id, endpoint: value.endpoint, public_key: value.public_key,
            balance_bits: value.balance_bits, context: value.context, retention: value.retention };
        break;
      case 'secret':
        if (typeof value.secret === 'string' && SECRET.test(value.secret)) return { kind: 'secret', secret: value.secret };
        break;
      case 'key_id':
        if (value.key_id === null || bytes(value.key_id, 32)) return { kind: 'key_id', key_id: value.key_id };
        break;
      case 'anchor_configuration':
        if (bytes(value.public_key, 33) && bytes(value.epoch))
          return { kind: 'anchor_configuration', public_key: value.public_key, epoch: value.epoch };
        break;
      case 'anchor_committed':
        if (bytes(value.state) && bytes(value.response) && typeof value.expires_at === 'number' && Number.isSafeInteger(value.expires_at))
          return { kind: 'anchor_committed', state: value.state, response: value.response, expires_at: value.expires_at };
        break;
      case 'message':
        if (bytes(value.bytes)) return { kind: 'message', bytes: value.bytes };
        break;
      case 'header':
        if (typeof value.value === 'string') return { kind: 'header', value: value.value };
        break;
      case 'operation':
        if (value.operation === 'none' || value.operation === 'issue' || value.operation === 'presentation' || value.operation === 'recovery')
          return { kind: 'operation', operation: value.operation };
        break;
      case 'issued':
        if (typeof value.credential === 'string' && (value.replay_id === null || bytes(value.replay_id, 32))
          && (value.epoch === null || bytes(value.epoch)) && (value.replay_id === null) === (value.epoch === null)
          && (value.retain_until === null || Number.isSafeInteger(value.retain_until)))
          return { kind: 'issued', credential: value.credential, replay_id: value.replay_id, epoch: value.epoch,
            retain_until: typeof value.retain_until === 'number' ? value.retain_until : null };
        break;
      case 'verified':
        if (bytes(value.nullifier, 32) && bytes(value.record) && typeof value.credential === 'string')
          return { kind: 'verified', nullifier: value.nullifier, record: value.record, credential: value.credential };
        break;
      case 'nullifier':
        if (bytes(value.nullifier, 32)) return { kind: 'nullifier', nullifier: value.nullifier };
        break;
    }
  }
  throw new Error('invalid crypto bridge response');
}

type Native = Awaited<ReturnType<typeof createModule>>;

function call(native: Native, command: Command): Reply {
  const input = new TextEncoder().encode(JSON.stringify(command));
  if (input.length > 1024 * 1024) throw new Error('crypto bridge input limit');
  try {
    if (native._guac_clear() !== 0) throw new Error('crypto bridge unavailable');
    // ponytail: bytewise ABI avoids unsafe pointers; inputs are a few KiB now that
    // state lives in Durable Objects. Use wasm-bindgen's Emscripten target if it dominates.
    for (const byte of input) if (native._guac_push(byte) !== 0) throw new Error('crypto bridge input rejected');
    if (native._guac_run() !== 0) throw new Error('crypto bridge failed');
    const length = native._guac_len();
    if (length <= 0 || length > 1024 * 1024) throw new Error('crypto bridge output limit');
    const output = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      const byte = native._guac_byte(i);
      if (byte > 255) throw new Error('crypto bridge output rejected');
      output[i] = byte;
    }
    try {
      return reply(JSON.parse(new TextDecoder('utf-8', { fatal: true, ignoreBOM: false }).decode(output)));
    } finally { output.fill(0); }
  } finally {
    input.fill(0);
    if (native._guac_clear() !== 0) throw new Error('crypto bridge cleanup failed');
  }
}

export type Crypto = Awaited<ReturnType<typeof createCrypto>>;

/** Secrets stored in R2: 32 bytes as lowercase hex. */
export const SECRET = /^[0-9a-f]{64}$/;

async function nativeModule() {
  return createModule({ instantiateWasm(imports, receive) {
    const instance = new WebAssembly.Instance(wasm, imports);
    receive(instance, wasm);
    return instance.exports;
  } });
}

/** A fresh secret, from the OS CSPRNG through Guac's key generation. */
export async function generateSecret(role: Role): Promise<string> {
  const reply = call(await nativeModule(), { kind: 'generate', role });
  if (reply.kind !== 'secret') throw new Error('key generation failed');
  return reply.secret;
}

export async function createAnchorCrypto(secret: string, epoch: number[]) {
  const native = await nativeModule();
  const configuration = call(native, { kind: 'anchor_init', secret, epoch });
  if (configuration.kind !== 'anchor_configuration') throw new Error('Anchor initialization failed');
  return { configuration, run: (command: Extract<Command, { kind: 'anchor_commit' | 'anchor_respond' }>) => call(native, command) };
}

/** One Wasm instance per Moderator key. No `anchors`: endorsements are not required. */
export async function createCrypto(secret: string, endpoint: string, context: string, anchors: AnchorSet | null, previous: AnchorSet | null) {
  const native = await nativeModule();
  const configuration = call(native, { kind: 'init', secret, endpoint, context, anchors, previous });
  if (configuration.kind !== 'configuration') throw new Error('Moderator initialization failed');
  return { configuration, run: (command: Exclude<Command, { kind: 'generate' | 'init' | 'anchor_init' | 'anchor_commit' | 'anchor_respond' }>) => call(native, command) };
}
