/* @ts-self-types="./guac.d.ts" */

export class AnchorConfig {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        AnchorConfigFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_anchorconfig_free(ptr, 0);
    }
    /**
     * @param {Uint8Array} key
     * @param {Uint8Array} epoch
     */
    constructor(key, epoch) {
        const ptr0 = passArray8ToWasm0(key, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(epoch, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.anchorconfig_new(ptr0, len0, ptr1, len1);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        this.__wbg_ptr = ret[0];
        AnchorConfigFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}
if (Symbol.dispose) AnchorConfig.prototype[Symbol.dispose] = AnchorConfig.prototype.free;

/**
 * Emptied only by a successful `present`.
 */
export class Credential {
    static __wrap(ptr) {
        const obj = Object.create(Credential.prototype);
        obj.__wbg_ptr = ptr;
        CredentialFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        CredentialFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_credential_free(ptr, 0);
    }
    /**
     * @returns {bigint}
     */
    get balance() {
        const ret = wasm.credential_balance(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return BigInt.asUintN(64, ret[0]);
    }
    /**
     * @param {Uint8Array} bytes
     * @param {ModeratorConfig} configuration
     * @returns {Credential}
     */
    static fromStorageBytes(bytes, configuration) {
        const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(configuration, ModeratorConfig);
        const ret = wasm.credential_fromStorageBytes(ptr0, len0, configuration.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return Credential.__wrap(ret[0]);
    }
    /**
     * Answers the protected resource's `WWW-Authenticate` field. Consumes
     * this credential only on success; on error it stays usable.
     * @param {string} www_authenticate
     * @returns {PendingPresentation}
     */
    present(www_authenticate) {
        const ptr0 = passStringToWasm0(www_authenticate, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.credential_present(this.__wbg_ptr, ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return PendingPresentation.__wrap(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    toStorageBytes() {
        const ret = wasm.credential_toStorageBytes(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
}
if (Symbol.dispose) Credential.prototype[Symbol.dispose] = Credential.prototype.free;

/**
 * Emptied only by a successful `requestCredential`.
 */
export class Endorsement {
    static __wrap(ptr) {
        const obj = Object.create(Endorsement.prototype);
        obj.__wbg_ptr = ptr;
        EndorsementFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        EndorsementFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_endorsement_free(ptr, 0);
    }
    /**
     * @param {Uint8Array} bytes
     * @param {AnchorConfig} configuration
     * @returns {Endorsement}
     */
    static fromStorageBytes(bytes, configuration) {
        const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(configuration, AnchorConfig);
        const ret = wasm.endorsement_fromStorageBytes(ptr0, len0, configuration.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return Endorsement.__wrap(ret[0]);
    }
    /**
     * Redeems this endorsement. Consumed only on success; on error it stays usable.
     * @param {ModeratorConfig} configuration
     * @param {string} www_authenticate
     * @returns {PendingIssuance}
     */
    requestCredential(configuration, www_authenticate) {
        _assertClass(configuration, ModeratorConfig);
        const ptr0 = passStringToWasm0(www_authenticate, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.endorsement_requestCredential(this.__wbg_ptr, configuration.__wbg_ptr, ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return PendingIssuance.__wrap(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    toStorageBytes() {
        const ret = wasm.endorsement_toStorageBytes(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
}
if (Symbol.dispose) Endorsement.prototype[Symbol.dispose] = Endorsement.prototype.free;

export class GrantStep {
    static __wrap(ptr) {
        const obj = Object.create(GrantStep.prototype);
        obj.__wbg_ptr = ptr;
        GrantStepFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        GrantStepFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_grantstep_free(ptr, 0);
    }
    /**
     * @returns {PendingGrant}
     */
    continueGrant() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.grantstep_continueGrant(ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return PendingGrant.__wrap(ret[0]);
    }
    /**
     * @returns {Endorsement}
     */
    finish() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.grantstep_finish(ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return Endorsement.__wrap(ret[0]);
    }
    /**
     * @returns {boolean}
     */
    get isComplete() {
        const ret = wasm.grantstep_isComplete(this.__wbg_ptr);
        return ret !== 0;
    }
}
if (Symbol.dispose) GrantStep.prototype[Symbol.dispose] = GrantStep.prototype.free;

export class ModeratorConfig {
    static __wrap(ptr) {
        const obj = Object.create(ModeratorConfig.prototype);
        obj.__wbg_ptr = ptr;
        ModeratorConfigFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ModeratorConfigFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_moderatorconfig_free(ptr, 0);
    }
    /**
     * The Redeem & Issue endpoint, which also answers recovery.
     * @returns {string}
     */
    get endpoint() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.moderatorconfig_endpoint(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Anchor keys are concatenated 33-byte public keys in their advertised order.
     * @param {string} endpoint
     * @param {Uint8Array} key
     * @param {number} balance_bits
     * @param {Uint8Array} context
     * @param {bigint} retention
     * @param {Uint8Array} anchor_keys
     * @param {Uint8Array} epoch
     * @returns {ModeratorConfig}
     */
    static withEndorsements(endpoint, key, balance_bits, context, retention, anchor_keys, epoch) {
        const ptr0 = passStringToWasm0(endpoint, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(key, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArray8ToWasm0(context, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passArray8ToWasm0(anchor_keys, wasm.__wbindgen_malloc);
        const len3 = WASM_VECTOR_LEN;
        const ptr4 = passArray8ToWasm0(epoch, wasm.__wbindgen_malloc);
        const len4 = WASM_VECTOR_LEN;
        const ret = wasm.moderatorconfig_withEndorsements(ptr0, len0, ptr1, len1, balance_bits, ptr2, len2, retention, ptr3, len3, ptr4, len4);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ModeratorConfig.__wrap(ret[0]);
    }
    /**
     * @param {string} endpoint
     * @param {Uint8Array} key
     * @param {number} balance_bits
     * @param {Uint8Array} context
     * @param {bigint} retention
     * @returns {ModeratorConfig}
     */
    static withoutEndorsement(endpoint, key, balance_bits, context, retention) {
        const ptr0 = passStringToWasm0(endpoint, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(key, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArray8ToWasm0(context, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ret = wasm.moderatorconfig_withoutEndorsement(ptr0, len0, ptr1, len1, balance_bits, ptr2, len2, retention);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ModeratorConfig.__wrap(ret[0]);
    }
}
if (Symbol.dispose) ModeratorConfig.prototype[Symbol.dispose] = ModeratorConfig.prototype.free;

export class PendingGrant {
    static __wrap(ptr) {
        const obj = Object.create(PendingGrant.prototype);
        obj.__wbg_ptr = ptr;
        PendingGrantFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PendingGrantFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pendinggrant_free(ptr, 0);
    }
    /**
     * Checks the response `Content-Type` before consuming this continuation.
     * @param {Uint8Array} response
     * @param {string} content_type
     * @returns {GrantStep}
     */
    advance(response, content_type) {
        const ptr = this.__destroy_into_raw();
        const ptr0 = passArray8ToWasm0(response, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(content_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.pendinggrant_advance(ptr, ptr0, len0, ptr1, len1);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return GrantStep.__wrap(ret[0]);
    }
    /**
     * @param {Uint8Array} bytes
     * @param {Uint8Array} original_request
     * @param {AnchorConfig} configuration
     * @returns {PendingGrant}
     */
    static fromStorageBytes(bytes, original_request, configuration) {
        const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(original_request, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        _assertClass(configuration, AnchorConfig);
        const ret = wasm.pendinggrant_fromStorageBytes(ptr0, len0, ptr1, len1, configuration.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return PendingGrant.__wrap(ret[0]);
    }
    /**
     * The request body; send it with `endorsementRequestType()`.
     * @returns {Uint8Array}
     */
    get request() {
        const ret = wasm.pendinggrant_request(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @returns {Uint8Array}
     */
    toStorageBytes() {
        const ret = wasm.pendinggrant_toStorageBytes(this.__wbg_ptr);
        return ret;
    }
}
if (Symbol.dispose) PendingGrant.prototype[Symbol.dispose] = PendingGrant.prototype.free;

/**
 * Emptied by `finish` once the response field parses.
 */
export class PendingIssuance {
    static __wrap(ptr) {
        const obj = Object.create(PendingIssuance.prototype);
        obj.__wbg_ptr = ptr;
        PendingIssuanceFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PendingIssuanceFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pendingissuance_free(ptr, 0);
    }
    /**
     * The `Authorization` value to POST to the Redeem & Issue endpoint.
     * @returns {string}
     */
    get authorization() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.pendingissuance_authorization(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * `mole_credential` is the response's `Mole-Credential` field. A missing
     * or malformed field retains the pending state; an invalid issuance
     * response consumes it, since issuance has no recovery.
     * @param {string | null} [mole_credential]
     * @returns {Credential}
     */
    finish(mole_credential) {
        var ptr0 = isLikeNone(mole_credential) ? 0 : passStringToWasm0(mole_credential, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        const ret = wasm.pendingissuance_finish(this.__wbg_ptr, ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return Credential.__wrap(ret[0]);
    }
    /**
     * @param {Uint8Array} bytes
     * @param {string} authorization
     * @param {ModeratorConfig} configuration
     * @returns {PendingIssuance}
     */
    static fromStorageBytes(bytes, authorization, configuration) {
        const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(authorization, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        _assertClass(configuration, ModeratorConfig);
        const ret = wasm.pendingissuance_fromStorageBytes(ptr0, len0, ptr1, len1, configuration.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return PendingIssuance.__wrap(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    toStorageBytes() {
        const ret = wasm.pendingissuance_toStorageBytes(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
}
if (Symbol.dispose) PendingIssuance.prototype[Symbol.dispose] = PendingIssuance.prototype.free;

export class PendingPresentation {
    static __wrap(ptr) {
        const obj = Object.create(PendingPresentation.prototype);
        obj.__wbg_ptr = ptr;
        PendingPresentationFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PendingPresentationFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pendingpresentation_free(ptr, 0);
    }
    /**
     * The `Authorization` value for the protected request.
     * @returns {string}
     */
    get authorization() {
        let deferred2_0;
        let deferred2_1;
        try {
            const ret = wasm.pendingpresentation_authorization(this.__wbg_ptr);
            var ptr1 = ret[0];
            var len1 = ret[1];
            if (ret[3]) {
                ptr1 = 0; len1 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * `mole_credential` is the response's `Mole-Credential` field, whatever
     * its status. Returns a replacement, or undefined for explicit
     * consumption. Failure, including a missing field, retains pending state.
     * @param {string | null} [mole_credential]
     * @returns {Credential | undefined}
     */
    finish(mole_credential) {
        var ptr0 = isLikeNone(mole_credential) ? 0 : passStringToWasm0(mole_credential, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        const ret = wasm.pendingpresentation_finish(this.__wbg_ptr, ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0] === 0 ? undefined : Credential.__wrap(ret[0]);
    }
    /**
     * @param {Uint8Array} bytes
     * @param {ModeratorConfig} configuration
     * @returns {PendingPresentation}
     */
    static fromStorageBytes(bytes, configuration) {
        const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(configuration, ModeratorConfig);
        const ret = wasm.pendingpresentation_fromStorageBytes(ptr0, len0, configuration.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return PendingPresentation.__wrap(ret[0]);
    }
    /**
     * The `Authorization` value for an empty POST to the Redeem & Issue
     * endpoint: recovers the recorded update without repeating the operation.
     * @returns {string}
     */
    get recoveryAuthorization() {
        let deferred2_0;
        let deferred2_1;
        try {
            const ret = wasm.pendingpresentation_recoveryAuthorization(this.__wbg_ptr);
            var ptr1 = ret[0];
            var len1 = ret[1];
            if (ret[3]) {
                ptr1 = 0; len1 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * @returns {Uint8Array}
     */
    toStorageBytes() {
        const ret = wasm.pendingpresentation_toStorageBytes(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
}
if (Symbol.dispose) PendingPresentation.prototype[Symbol.dispose] = PendingPresentation.prototype.free;

/**
 * `Content-Type` of grant requests.
 * @returns {string}
 */
export function endorsementRequestType() {
    let deferred1_0;
    let deferred1_1;
    try {
        const ret = wasm.endorsementRequestType();
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
}

/**
 * Requests a credential from a Moderator that requires no endorsement.
 * `www_authenticate` is the Redeem & Issue endpoint's challenge field.
 * @param {ModeratorConfig} configuration
 * @param {string} www_authenticate
 * @returns {PendingIssuance}
 */
export function requestCredential(configuration, www_authenticate) {
    _assertClass(configuration, ModeratorConfig);
    const ptr0 = passStringToWasm0(www_authenticate, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.requestCredential(configuration.__wbg_ptr, ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return PendingIssuance.__wrap(ret[0]);
}

/**
 * @param {AnchorConfig} configuration
 * @returns {PendingGrant}
 */
export function startGrant(configuration) {
    _assertClass(configuration, AnchorConfig);
    const ret = wasm.startGrant(configuration.__wbg_ptr);
    return PendingGrant.__wrap(ret);
}
function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg___wbindgen_throw_bb96b2010945f0bc: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbg_getRandomValues_436a51d0629d84e1: function() { return handleError(function (arg0, arg1) {
            globalThis.crypto.getRandomValues(getArrayU8FromWasm0(arg0, arg1));
        }, arguments); },
        __wbg_new_358857d90afd5a2d: function(arg0, arg1) {
            const ret = new Error(getStringFromWasm0(arg0, arg1));
            return ret;
        },
        __wbg_new_from_slice_3eea173078478cfe: function(arg0, arg1) {
            const ret = new Uint8Array(getArrayU8FromWasm0(arg0, arg1));
            return ret;
        },
        __wbg_set_8155bb79a948541b: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = Reflect.set(arg0, arg1, arg2);
            return ret;
        }, arguments); },
        __wbindgen_cast_0000000000000001: function(arg0, arg1) {
            // Cast intrinsic for `Ref(String) -> Externref`.
            const ret = getStringFromWasm0(arg0, arg1);
            return ret;
        },
        __wbindgen_init_externref_table: function() {
            const table = wasm.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        },
    };
    return {
        __proto__: null,
        "./guac_bg.js": import0,
    };
}

const AnchorConfigFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_anchorconfig_free(ptr, 1));
const CredentialFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_credential_free(ptr, 1));
const EndorsementFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_endorsement_free(ptr, 1));
const GrantStepFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_grantstep_free(ptr, 1));
const ModeratorConfigFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_moderatorconfig_free(ptr, 1));
const PendingGrantFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pendinggrant_free(ptr, 1));
const PendingIssuanceFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pendingissuance_free(ptr, 1));
const PendingPresentationFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pendingpresentation_free(ptr, 1));

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_externrefs.set(idx, obj);
    return idx;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

function getStringFromWasm0(ptr, len) {
    return decodeText(ptr >>> 0, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_externrefs.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasmInstance, wasm;
function __wbg_finalize_init(instance, module) {
    wasmInstance = instance;
    wasm = instance.exports;
    wasmModule = module;
    cachedUint8ArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (!module.ok) {
            throw new Error(`failed to fetch Wasm: ${module.status} ${module.statusText} fetching '${module.url}'`);
        }

        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('guac_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
