import path from "node:path";
import type { Plugin } from "vite";

/** Route compiled Wasm through the Workers pool's native module loader instead of Vite's
 * unsupported Wasm ESM loader. No runtime compilation or fake crypto in these tests. */
export const wasmModules: Plugin = {
  name: "compiled-wasm-modules",
  enforce: "pre",
  resolveId(source, importer) {
    if (source.endsWith(".wasm") && importer) return path.resolve(path.dirname(importer), source);
  },
  load(id) {
    if (id.endsWith(".wasm")) return `import { createRequire } from 'node:module';
      export default createRequire(import.meta.url)(${JSON.stringify(id + "?module")}).default;`;
  },
};
