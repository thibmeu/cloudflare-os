/* tslint:disable */
/* eslint-disable */

export class AnchorConfig {
    free(): void;
    [Symbol.dispose](): void;
    constructor(key: Uint8Array, epoch: Uint8Array);
}

/**
 * Emptied only by a successful `present`.
 */
export class Credential {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static fromStorageBytes(bytes: Uint8Array, configuration: ModeratorConfig): Credential;
    /**
     * Answers the protected resource's `WWW-Authenticate` field. Consumes
     * this credential only on success; on error it stays usable.
     */
    present(www_authenticate: string): PendingPresentation;
    toStorageBytes(): Uint8Array;
    readonly balance: bigint;
}

/**
 * Emptied only by a successful `requestCredential`.
 */
export class Endorsement {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static fromStorageBytes(bytes: Uint8Array, configuration: AnchorConfig): Endorsement;
    /**
     * Redeems this endorsement. Consumed only on success; on error it stays usable.
     */
    requestCredential(configuration: ModeratorConfig, www_authenticate: string): PendingIssuance;
    toStorageBytes(): Uint8Array;
}

export class GrantStep {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    continueGrant(): PendingGrant;
    finish(): Endorsement;
    readonly isComplete: boolean;
}

export class ModeratorConfig {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Anchor keys are concatenated 33-byte public keys in their advertised order.
     */
    static withEndorsements(endpoint: string, key: Uint8Array, balance_bits: number, context: Uint8Array, retention: bigint, anchor_keys: Uint8Array, epoch: Uint8Array): ModeratorConfig;
    static withoutEndorsement(endpoint: string, key: Uint8Array, balance_bits: number, context: Uint8Array, retention: bigint): ModeratorConfig;
    /**
     * The Redeem & Issue endpoint, which also answers recovery.
     */
    readonly endpoint: string;
}

export class PendingGrant {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Checks the response `Content-Type` before consuming this continuation.
     */
    advance(response: Uint8Array, content_type: string): GrantStep;
    static fromStorageBytes(bytes: Uint8Array, original_request: Uint8Array, configuration: AnchorConfig): PendingGrant;
    toStorageBytes(): Uint8Array;
    /**
     * The request body; send it with `endorsementRequestType()`.
     */
    readonly request: Uint8Array;
}

/**
 * Emptied by `finish` once the response field parses.
 */
export class PendingIssuance {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    /**
     * `mole_credential` is the response's `Mole-Credential` field. A missing
     * or malformed field retains the pending state; an invalid issuance
     * response consumes it, since issuance has no recovery.
     */
    finish(mole_credential?: string | null): Credential;
    static fromStorageBytes(bytes: Uint8Array, authorization: string, configuration: ModeratorConfig): PendingIssuance;
    toStorageBytes(): Uint8Array;
    /**
     * The `Authorization` value to POST to the Redeem & Issue endpoint.
     */
    readonly authorization: string;
}

export class PendingPresentation {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    /**
     * `mole_credential` is the response's `Mole-Credential` field, whatever
     * its status. Returns a replacement, or undefined for explicit
     * consumption. Failure, including a missing field, retains pending state.
     */
    finish(mole_credential?: string | null): Credential | undefined;
    static fromStorageBytes(bytes: Uint8Array, configuration: ModeratorConfig): PendingPresentation;
    toStorageBytes(): Uint8Array;
    /**
     * The `Authorization` value for the protected request.
     */
    readonly authorization: string;
    /**
     * The `Authorization` value for an empty POST to the Redeem & Issue
     * endpoint: recovers the recorded update without repeating the operation.
     */
    readonly recoveryAuthorization: string;
}

/**
 * `Content-Type` of grant requests.
 */
export function endorsementRequestType(): string;

/**
 * Requests a credential from a Moderator that requires no endorsement.
 * `www_authenticate` is the Redeem & Issue endpoint's challenge field.
 */
export function requestCredential(configuration: ModeratorConfig, www_authenticate: string): PendingIssuance;

export function startGrant(configuration: AnchorConfig): PendingGrant;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_anchorconfig_free: (a: number, b: number) => void;
    readonly __wbg_credential_free: (a: number, b: number) => void;
    readonly __wbg_endorsement_free: (a: number, b: number) => void;
    readonly __wbg_grantstep_free: (a: number, b: number) => void;
    readonly __wbg_moderatorconfig_free: (a: number, b: number) => void;
    readonly __wbg_pendinggrant_free: (a: number, b: number) => void;
    readonly __wbg_pendingissuance_free: (a: number, b: number) => void;
    readonly __wbg_pendingpresentation_free: (a: number, b: number) => void;
    readonly anchorconfig_new: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly credential_balance: (a: number) => [bigint, number, number];
    readonly credential_fromStorageBytes: (a: number, b: number, c: number) => [number, number, number];
    readonly credential_present: (a: number, b: number, c: number) => [number, number, number];
    readonly credential_toStorageBytes: (a: number) => [number, number, number];
    readonly endorsementRequestType: () => [number, number];
    readonly endorsement_fromStorageBytes: (a: number, b: number, c: number) => [number, number, number];
    readonly endorsement_requestCredential: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly endorsement_toStorageBytes: (a: number) => [number, number, number];
    readonly grantstep_continueGrant: (a: number) => [number, number, number];
    readonly grantstep_finish: (a: number) => [number, number, number];
    readonly grantstep_isComplete: (a: number) => number;
    readonly moderatorconfig_endpoint: (a: number) => [number, number];
    readonly moderatorconfig_withEndorsements: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: bigint, i: number, j: number, k: number, l: number) => [number, number, number];
    readonly moderatorconfig_withoutEndorsement: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: bigint) => [number, number, number];
    readonly pendinggrant_advance: (a: number, b: number, c: number, d: number, e: number) => [number, number, number];
    readonly pendinggrant_fromStorageBytes: (a: number, b: number, c: number, d: number, e: number) => [number, number, number];
    readonly pendinggrant_request: (a: number) => [number, number];
    readonly pendinggrant_toStorageBytes: (a: number) => any;
    readonly pendingissuance_authorization: (a: number) => [number, number];
    readonly pendingissuance_finish: (a: number, b: number, c: number) => [number, number, number];
    readonly pendingissuance_fromStorageBytes: (a: number, b: number, c: number, d: number, e: number) => [number, number, number];
    readonly pendingissuance_toStorageBytes: (a: number) => [number, number, number];
    readonly pendingpresentation_authorization: (a: number) => [number, number, number, number];
    readonly pendingpresentation_finish: (a: number, b: number, c: number) => [number, number, number];
    readonly pendingpresentation_fromStorageBytes: (a: number, b: number, c: number) => [number, number, number];
    readonly pendingpresentation_recoveryAuthorization: (a: number) => [number, number, number, number];
    readonly pendingpresentation_toStorageBytes: (a: number) => [number, number, number];
    readonly requestCredential: (a: number, b: number, c: number) => [number, number, number];
    readonly startGrant: (a: number) => number;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
