# Pinned Guac client

Generated, unmodified wasm-bindgen bindings for Guac
`a70210c00a0eaeaaca0874ddb5fe351b8365784f`, the revision used by the committed
example-mole-workers `b8099315cf3fda6688337d7d353e3dcf52df5e14`.
Public upstream: https://github.com/cloudflareresearch/guac (Apache-2.0).
Artifact source: https://gitlab.cfdata.org/cloudflare/crypto/guac at the revision
above. That historical commit is not available in the public repository and uses
Rollatini, before the public repository's newer EC-IHAT wire format. The public
repository is not a drop-in source for regenerating these artifacts. Upgrade
client and example servers together.

Build from a clean checkout at that revision, with its committed Cargo.lock:

```sh
wasm-pack build --target web --out-dir /tmp/cfos-mole-wasm --out-name guac --no-opt --features browser --locked
```

Copy `guac.js`, `guac.d.ts`, and `guac_bg.wasm` here. Build used Rust 1.96.0,
wasm-pack 0.13.0, wasm-bindgen 0.2.127. Vendoring the generated artifacts keeps
ordinary pnpm builds independent of Rust and internal GitLab access.

The Worker imports the compiled Wasm module and calls `initSync` inside a request;
there is no runtime compilation or network download. Do not hand-edit generated files.
