# Real example Anchor / Moderator crypto fixture

`runtime.ts` and `native.d.ts` are copied unchanged from
https://gitlab.cfdata.org/cloudflare/crypto/example-mole-workers at
`b8099315cf3fda6688337d7d353e3dcf52df5e14`.

`build/crypto.js` and `build/crypto.wasm` were rebuilt from that clean checkout,
using its committed Cargo.toml/Cargo.lock (Guac `a70210c`), with `node build.mjs`.
Build tools: Rust 1.96.0, Emscripten 6.0.10. No signing keys are in these binaries.
The tests supply deterministic, test-only keys at runtime.

To regenerate, check out that revision, run `node build.mjs`, and copy the two
build outputs here. No production Worker imports this fixture. Tests use its real
cryptography while controlling HTTP delivery and replay records in the test host.
