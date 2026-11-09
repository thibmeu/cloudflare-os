declare module '*crypto.js' {
  interface NativeModule {
    _guac_clear(): number;
    _guac_push(byte: number): number;
    _guac_run(): number;
    _guac_len(): number;
    _guac_byte(index: number): number;
  }
  export default function createModule(options: {
    instantiateWasm(imports: WebAssembly.Imports,
      receive: (instance: WebAssembly.Instance, module: WebAssembly.Module) => void): WebAssembly.Exports;
  }): Promise<NativeModule>;
}

declare module '*.wasm' {
  const module: WebAssembly.Module;
  export default module;
}
